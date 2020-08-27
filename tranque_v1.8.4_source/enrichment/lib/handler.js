const fs = require("fs");
const path = require("path");
const util = require("util");

const backend = require("./backend");
const {generateId} = require("./backend/models");
const conf = require("./conf");
const log = require("./log");
const timeseries = require("./timeseries");
const stats = require("./stats");

// A single-execution procedure that fetches a list of enrichment
// modules to load dynamically.
const enrichmentModules = (() => {
  let promise = null;
  return () => {
    if (promise !== null) {
      return promise;
    }
    promise = util
      .promisify(fs.readdir)(conf.IMPLEMENTATION_BASE)
      .then((children) =>
        Promise.all(
          children
            .map((child) => path.join(conf.IMPLEMENTATION_BASE, child))
            .map((modulePath) =>
              util
                .promisify(fs.stat)(modulePath)
                .then((stat) => ({modulePath, stat}))
            )
        )
      )
      .then((children) => children.filter(({stat}) => stat.isDirectory()))
      .then((children) => {
        const modules = children.map(({modulePath}) => modulePath);
        log.info(`Enrichment modules found: ${modules.join(", ")}`);
        return modules;
      });
    return promise;
  };
})();

exports.enrichmentModules = enrichmentModules;

// The dependencies injected into the enrichment modules.
const packagedDependencies = {
  conf,
  log,
  backend,
  stats,
  timeseries: {
    client: timeseries.client,
    saveEvents: timeseries.saveEvents,
  },
};

exports.packagedDependencies = packagedDependencies;

// Deals with a message from the amqp broker, persists it and its
// content, and gives it a valid ID.
const receiveMessage = async (message) => {
  let parsed;
  try {
    parsed = JSON.parse(message);
  } catch (err) {
    log.error("Message wasn't valid JSON", message);
    throw err;
  }
  log.debug("Got valid JSON message", parsed);
  if (typeof parsed.events === "undefined") {
    log.error("Message missing 'events' property", message);
    throw new Error("Message missing 'events' property");
  }
  const savedMessage = await timeseries.saveMessage(parsed);
  const events = await timeseries.saveEvents(
    savedMessage.payload.events || [],
    savedMessage.messageId
  );
  // Each enrichment module is responsible for correctly identifying
  // dependencies. A new message will trigger deletion of dependent
  // events.
  await timeseries.removeDependent(events);
  return {
    ...savedMessage,
    payload: {...savedMessage.payload, events},
  };
};

// Dispatch a message to each of the enrichment modules.
const dispatch = async (message) => {
  const [{payload, messageId}, modules] = await Promise.all([
    receiveMessage(message),
    enrichmentModules(),
  ]);
  if (modules.length === 0) {
    throw new Error("there aren't any enrichment modules");
  }
  const outputs = await Promise.all(
    modules.map(async (mod) => {
      try {
        return await module
          .require(mod)
          .handler(payload, packagedDependencies, messageId);
      } catch (err) {
        log.exception(err, {messageId});
        return [];
      }
    })
  );
  const flattenedOutputs = outputs.flat();
  await timeseries.refreshIndices(flattenedOutputs);
  return {
    id: generateId(),
    command: conf.ENRICHMENT_FORWARD_COMMAND,
    body: {
      raw_message_id: messageId,
      outputs_count: flattenedOutputs.length,
    },
    extra: {
      outputs: flattenedOutputs,
    },
    origin: conf.NAMESPACE,
    created_at: new Date(),
  };
};

exports.dispatch = dispatch;
