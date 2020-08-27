const {Client} = require("@elastic/elasticsearch");

const conf = require("./conf");
const {identify} = require("./identity");
const log = require("./log");
const messagesTemplate = require("../messages.json");
const derivedTemplate = require("../derived.json");

// The main interface to Elasticsearch. Docs available at
// https://github.com/elastic/elasticsearch-js#documentation
const innerClient = new Client({node: conf.ELASTICSEARCH_NODE});

// Wraps a client method with logging and short-circuiting
const wrapClientMethod = (methodName) => {
  const parts = methodName.split(".");
  const method = parts.reduce((obj, part) => (obj || {})[part], innerClient);
  if (typeof method === "undefined") {
    throw new Error(`invalid elasticsearch client method: ${methodName}`);
  }
  return (...args) =>
    method.call(client, ...args).then(({body, statusCode, warnings}) => {
      if ((warnings || []).length > 0) {
        warnings.forEach((w) => log.warn(w));
      }
      if (~~(statusCode / 100) !== 2) {
        return Promise.reject(new Error(`Elasticsearch status code: ${statusCode}`));
      }
      return body;
    });
};

const client = {
  indices: {
    putTemplate: wrapClientMethod("indices.putTemplate"),
    refresh: wrapClientMethod("indices.refresh"),
  },
  index: wrapClientMethod("index"),
  bulk: wrapClientMethod("bulk"),
  deleteByQuery: wrapClientMethod("deleteByQuery"),
  search: wrapClientMethod("search"),
  scroll: wrapClientMethod("scroll"),
  get: wrapClientMethod("get"),
  msearch: wrapClientMethod("msearch"),
};

exports.client = client;

// A single-execution procedure that ensures the existence of the
// required templates for the messages and derived timeseries
// collections.
const setup = (() => {
  let done = false;
  return async () => {
    if (done) {
      return;
    }
    log.info("Adding derived timeseries template");
    await client.indices
      .putTemplate({
        create: false,
        name: "derived-timeseries",
        body: derivedTemplate,
      })
      .then(() => log.info("Template added successfully"))
      .catch((err) => {
        log.error("Couldn't add derived timeseries template");
        return Promise.reject(err);
      });
    log.info("Adding messages template");
    await client.indices
      .putTemplate({
        create: false,
        name: "derivation-messages",
        body: messagesTemplate,
      })
      .then(() => log.info("Template added successfully"))
      .catch((err) => {
        log.error("Couldn't add messages template");
        return Promise.reject(err);
      });
    done = true;
  };
})();

exports.setup = setup;

// Saves a message in Elasticsearch and returns the message wrapped in
// a structure: {@timestamp, eventCount, messageId, payload} where
// payload is the original message.
const saveMessage = async (payload) => {
  await setup();
  const now = new Date().toJSON();
  const indexSuffix = now.slice(0, 7).replace("-", ".");
  const message = {
    "@timestamp": now,
    "payload": payload,
    "eventCount": (payload.events || []).length || 0,
  };
  const response = await client.index({
    index: `messages-${indexSuffix}`,
    body: message,
  });
  return {
    ...message,
    messageId: `messages-${indexSuffix}/_doc/${response._id}`,
  };
};

exports.saveMessage = saveMessage;

const derivedIndexForEvent = (event) => {
  const suffix = new Date(event["@timestamp"]).toJSON().slice(0, 7).replace("-", ".");
  return `derived-${suffix}`;
};

// Source:
// https://www.elastic.co/guide/en/elasticsearch/reference/7.3/mapping-fields.html
const metaFields = [
  "_index",
  "_type",
  "_id",
  "_source",
  "_size",
  "_field_names",
  "_ignored",
  "_routing",
  "_meta",
];

// Saves a collection of events to their respective indices,
// annotating them with extra labels and dependencies. The returned
// collection won't contain duplicates, if any exist (according to
// event identity).
const saveEvents = async (events, messageId, dependencies = []) => {
  await setup();
  const identifiedEvents = events.map((e) => ({...e, _id: identify(e), dependencies}));
  const derivedAt = new Date().toJSON();
  await client.bulk({
    refresh: conf.NODE_ENV === "test" ? "true" : "false",
    body: identifiedEvents
      .map((event) => ({
        ...event,
        labels: [
          ...(event.labels || []),
          {key: "enrichment-version", value: conf.COMMIT},
          ...(messageId ? [{key: "message-id", value: messageId}] : []),
          {key: "derived-at", value: derivedAt},
        ],
      }))
      .flatMap((event) => [
        {
          index: {
            _index: derivedIndexForEvent(event), // The partition based on timestamp
            _id: event._id, // A predictable identity based on certain event fields
          },
        },
        Object.entries(event)
          .filter(([k]) => metaFields.indexOf(k) === -1)
          .reduce((acc, [k, v]) => ({...acc, [k]: v}), {}),
      ]),
  });
  return identifiedEvents.filter(
    (event, index) =>
      identifiedEvents.slice(index + 1).findIndex((e) => e._id === event._id) === -1
  );
};

exports.saveEvents = saveEvents;

// Deletes events from elasticsearch that are marked as dependent to
// *events*.
const removeDependent = async (events) => {
  const ids = Array.from(
    new Set(events.map((e) => (typeof e._id === "string" ? e._id : identify(e))))
  );
  await client.deleteByQuery({
    index: "derived-*",
    ignoreUnavailable: true,
    allowNoIndices: true,
    conflicts: "proceed",
    scroll: "1m",
    refresh: true,
    scrollSize: 200,
    body: {query: {terms: {dependencies: ids}}},
  });
};

exports.removeDependent = removeDependent;

// Refreshes all indices relevant to *events*
const refreshIndices = async (events) => {
  if (events.length === 0) {
    return;
  }
  const indices = Array.from(new Set(events.map(derivedIndexForEvent)));
  await client.indices.refresh({index: indices.join(",")});
  log.info(`Refreshed ${indices.length} indices`);
};

exports.refreshIndices = refreshIndices;

// Scrolls over all raw data indexed at *index* and saves it in chunks
// of *chunkSize* to derived indices as in *saveEvents(events)*.
const digest = async (index, chunkSize) => {
  if (typeof chunkSize !== "number" || isNaN(chunkSize) || chunkSize <= 0) {
    return log.error("Invalid chunkSize");
  }
  const messageId = `digest-${new Date().toJSON()}`;
  const initial = await client.search({
    index,
    scroll: "1m",
    size: chunkSize,
    body: {query: {match_all: {}}},
  });
  let {
    _scroll_id,
    hits: {
      total: {value: total},
      hits,
    },
  } = initial;
  let current = hits.length;
  log.info(`Digesting a total of ${total} raw events`);
  await saveEvents(
    hits.map(({_source}) => _source),
    messageId
  );
  log.info(`Digested ${current} out of ${total}`);
  while (current < total) {
    const page = await client.scroll({
      scrollId: _scroll_id,
      scroll: "1m",
    });
    _scroll_id = page._scroll_id;
    total = page.hits.total.value;
    hits = page.hits.hits;
    current += hits.length;
    await saveEvents(
      hits.map(({_source}) => _source),
      messageId
    );
    log.info(`Digested ${current} out of ${total}`);
  }
};

exports.digest = digest;
