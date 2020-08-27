const {RefsCache} = require("./refs-cache");
const {ValuesCache} = require("./values-cache");
const {makeDependencies} = require("./dependencies");
const {mergePlans} = require("./plans");
const {resolveScript} = require("./importer");

module.exports.handler = async (message, context, messageId) => {
  // Destruct arguments.
  const givenEvents = message.events;
  const {backend, log, timeseries, stats} = context;
  const givenNames = new Set(givenEvents.map((event) => event.name));
  if (givenNames.size === 0) {
    throw new Error("message is empty");
  }
  // Check for real time series.
  const names = await backend.existingTimeseries(givenNames);
  if (names.size === 0) {
    log.warn("No existing timeseries found in the message", {
      givenNames: Array.from(givenNames),
      messageId,
    });
    return [];
  }
  const events = givenEvents.filter((event) => names.has(event.name));
  if (events.length !== givenEvents.length) {
    log.warn(`Won't process ${givenEvents.length - events.length} events`, {
      messageId,
      excluded: Array.from(givenNames).filter((name) => !names.has(name)),
    });
  }
  // Build the time interval that contains the events of interest.
  const timeframe = (() => {
    const ts = events.map((event) => event["@timestamp"]).sort();
    return {
      start: ts[0],
      end: ts[ts.length - 1],
      from: ts[0],
      to: ts[ts.length - 1],
    };
  })();

  log.debug("Events", {messageId, events: Array.from(names)});
  // Initialize the reference cache, and build the main execution
  // plan.
  const refsCache = new RefsCache(timeframe.end, backend);
  // A map of name -> single-name-plan
  const plans = await (async () => {
    const nameKeys = Array.from(names);
    const planValues = await refsCache.getPlans(nameKeys);
    return nameKeys
      .map((name, index) => [name, planValues[index]])
      .reduce((acc, [name, plan]) => ({...acc, [name]: plan}), {});
  })();
  // The consolidated execution plan, governing the whole message.
  const executionPlan = mergePlans(Object.values(plans));
  log.info(`Execution plan is ${executionPlan.length} steps`, {messageId});
  log.debug("Execution plan", {messageId, executionPlan});

  // Initialize the values cache and preload the series in the
  // execution plan.
  const valuesCache = new ValuesCache(timeframe.end, events, timeseries, messageId);
  await refsCache.getMany(executionPlan);
  // Keep track of effective computation for each time series. This
  // allows for short-circuiting steps when no input produced changes
  // (i.e. was effective).
  const effective = Array.from(names).reduce(
    (acc, ts) => ({
      ...acc,
      [ts]: true,
    }),
    {}
  );
  // Walk through each step of the plan.
  return executionPlan.reduce(
    (promise, stepName) =>
      promise.then(async (previous) => {
        // Starting from the root reference for this step.
        const rootRef = await refsCache.get(stepName);
        if (
          (rootRef.inputs || []).length > 0 &&
          rootRef.inputs.every((prevStep) => !effective[prevStep])
        ) {
          // Short-circuit if no previous step was effective.
          log.info("timeseries doesn't have any new inputs", {
            messageId,
            timeseries: stepName,
          });
          return previous;
        }
        // Dynamically import the script for this step.
        const scriptFn = resolveScript(context, messageId, rootRef);
        if (!scriptFn) {
          if (rootRef.type === "derived") {
            log.info("timeseries doesn't have a declared script", {
              messageId,
              timeseries: stepName,
            });
          }
          return previous;
        }
        // Accumulate results into a script-external collection.
        const output = [];
        // Initialize the script dependencies (they're 'fresh' for each
        // execution step)
        const dependencies = makeDependencies({
          messageId,
          log,
          stats,
          refsCache,
          valuesCache,
          timeframe,
          rootRef,
          output,
        });
        try {
          return scriptFn(dependencies).then(
            async () => {
              if (output.length === 0) {
                // If the script produced no changes, continue and don't
                // mark it 'effective'
                log.info("no values indexed", {messageId, timeseries: stepName});
                valuesCache.touch(rootRef);
                return previous;
              } else {
                log.info(`${output.length} values indexed`, {
                  messageId,
                  timeseries: stepName,
                });
              }
              // Otherwise, persist the changes and build a trace of
              // dependencies for the new events.
              const persisted = await valuesCache.index(
                output,
                Array.from(
                  new Set([
                    ...dependencies.series.fetched().map(({_id}) => _id),
                    ...dependencies.series
                      .fetched()
                      .filter(({name}) => name !== stepName)
                      .flatMap((fetched) => fetched.dependencies || []),
                  ])
                )
              );
              // Mark it effective, and
              effective[stepName] = true;
              // Accumulate results.
              return [...previous, ...persisted];
            },
            (err) => {
              // If the script failed asynchronously, continue and don't
              // mark it 'effective'
              log.error(`Engine failed execution: ${err}`, {
                stack: (err.stack || "")
                  .split("\n")
                  .slice(1)
                  .map((s) => s.trim()),
                messageId,
                timeseries: stepName,
              });
              valuesCache.touch(rootRef);
              return previous;
            }
          );
        } catch (syncError) {
          // If the script failed synchronously, continue and don't mark
          // it 'effective'
          log.error(`Engine failed execution: ${syncError}`, {
            stack: (syncError.stack || "")
              .split("\n")
              .slice(1)
              .map((s) => s.trim()),
            messageId,
            timeseries: stepName,
          });
          valuesCache.touch(rootRef);
          return previous;
        }
      }),
    Promise.resolve([])
  );
};
