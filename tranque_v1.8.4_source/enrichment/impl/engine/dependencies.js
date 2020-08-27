const moment = require("moment");

const patternToRegExp = (pattern) => {
  const regex = pattern
    .replace(/\\/g, "\\\\")
    .replace(/\./g, "\\.")
    .replace(/\+/g, "\\+")
    .replace(/\[/g, "\\[")
    .replace(/\]/g, "\\]")
    .replace(/\^/g, "\\^")
    .replace(/\$/g, "\\$")
    .replace(/\*/g, ".*");
  return new RegExp(`^${regex}$`);
};

const match = (rootRef, pattern) => {
  const found = rootRef.inputs.filter((input) => patternToRegExp(pattern).test(input));
  if (found.length === 0) {
    throw new Error(`no input reference matches the given pattern: ${pattern}`);
  } else if (found.length > 1) {
    throw new Error(`too many input references match the given pattern: ${pattern}`);
  }
  return found[0];
};

const matches = (rootRef, pattern) =>
  rootRef.inputs.filter((input) => patternToRegExp(pattern).test(input));

const parseSpec = (refParser) => (rootRef, valuesCache, spec) => {
  if (typeof spec !== "object") {
    throw new Error(`invalid query spec: ${spec}`);
  }
  const {
    // a head query
    head,
    all,
    // a slice query
    slice,
    count,
    since,
    until,
    // common options for both queries
    tag,
    valueEq,
    valueGt,
    valueLt,
    valueGte,
    valueLte,
  } = spec;
  const valueRange = {valueEq, valueGt, valueLt, valueGte, valueLte};
  const parsedHead = refParser(rootRef, head);
  if (parsedHead !== null) {
    return parsedHead.map((ref) => valuesCache.head(ref, tag, valueRange, all));
  }
  const parsedSlice = refParser(rootRef, slice);
  if (parsedSlice !== null) {
    if (typeof since !== "undefined" || typeof until !== "undefined") {
      return parsedSlice.map((ref) =>
        valuesCache.sliceSinceUntil(ref, since, until, count, tag, valueRange)
      );
    }
    return parsedSlice.map((ref) => valuesCache.slice(ref, count, tag, valueRange));
  }
  throw new Error("unknown query spec; options are (head, slice)");
};

const specToQuery = parseSpec((root, q) =>
  typeof q === "string" ? [match(root, q)] : typeof q !== "undefined" ? [q] : null
);

const specToExpansion = parseSpec((root, q) =>
  typeof q === "string"
    ? matches(root, q)
    : typeof q !== "undefined" && Array.isArray(q)
    ? q
    : null
);

module.exports.makeDependencies = ({
  messageId,
  log,
  stats,
  refsCache,
  valuesCache,
  timeframe,
  rootRef,
  output,
}) => {
  const timeseries = rootRef.canonical_name;

  const dependencies = {};

  // context constants
  dependencies.ctx = {
    messageId,
    timeframe: {...timeframe},
    now: new Date().toJSON(),
    rootRef: {...rootRef},
  };

  // obtain references to timeseries
  dependencies.refs = {
    /**
     * Get one matching input name, or fail.
     * @param pattern string the pattern to use when matching input
     * timeseries
     * @returns string
     */
    match: (pattern = "*") => match(rootRef, pattern),

    /**
     * Get all matching input names.
     * @param pattern string the pattern to use when matching input
     * timeseries
     * @returns [string]
     */
    expand: (pattern = "*") => matches(rootRef, pattern),

    /**
     * Get one input reference from the backend. Fail if the matched
     * references are more or less than 1.
     * @param pattern string the pattern to use when matching input
     * timeseries
     * @returns Promise<ref>
     */
    getOne: (pattern = "*") => {
      return refsCache.get(match(rootRef, pattern));
    },

    /**
     * Get all input references that match the patterns from the
     * backend.
     * @param patterns [string] the patterns to use when matching
     * input timeseries
     * @returns Promise<[ref]>
     */
    getMany: (...patterns) => {
      return refsCache.getMany(patterns.flatMap((pattern) => matches(rootRef, pattern)));
    },

    /**
     * Acquire a protocol for the current timeseries.
     * @param protocol [string] the protocol identifier
     * @param meta [any] the acquisition metadata
     * @param decider [function] the decider function
     * @returns Promise<boolean>
     */
    acquireProtocol: (protocol, meta, decider = () => false) => {
      return refsCache.acquireProtocol(rootRef.canonical_name, protocol, meta, decider);
    },

    /**
     * Get a parameter for the current timeseries.
     * @param name string the name of the parameter.
     * @returns Promise<parameter>
     */
    param: (name) =>
      refsCache.getParameter(rootRef, name).then((p) => {
        if (p === null) {
          log.warn(`Parameter ${name} doesn't exist`, {messageId, timeseries});
          return null;
        }
        return p.value;
      }),

    /**
     * Deprecated in favor of refs.param.
     *
     * Get a parameter for the current timeseries.
     * @param name string the name of the parameter.
     * @returns Promise<{value: parameter} | null>
     */
    getParameter: (name) => {
      log.warn("refs.getParameter() is deprecated in favor of refs.param()", {
        messageId,
        timeseries,
      });
      return refsCache.getParameter(rootRef, name);
    },
  };

  // Keep track of all the fetched values obtained by this
  // dependencies instance.
  const fetchedEvents = [];

  // Save whatever comes whithin variant, which is an event, a list of
  // events, or an arbitrarily nested list of events.
  const saveFetched = (variant) => {
    if (Array.isArray(variant)) {
      variant.forEach(saveFetched);
    } else if (typeof variant !== "undefined") {
      fetchedEvents.push(variant);
    }
    return variant;
  };

  // Keep track of a counter of saves performed by this dependencies
  // object. Use this as a sequence number.
  let saved = 0;

  // obtain values from time series
  dependencies.series = {
    /**
     * Execute a series of queries specified by each spec given, and
     * yield the results. The results will be wrapped in a list if
     * many specs are given, and unwrapped if only one spec is given.
     * @param specs spec|[spec] Specs of queries to execute.
     * @returns Promise<result>|Promise<[result]>
     */
    query: (specs) =>
      (Array.isArray(specs)
        ? valuesCache.resolve(
            specs.map((spec) => specToQuery(rootRef, valuesCache, spec)[0])
          )
        : valuesCache
            .resolve(specToQuery(rootRef, valuesCache, specs))
            .then((results) => results[0])
      ).then(saveFetched),

    /**
     * Expands the query spec given and execute the expanded series of
     * queries, yielding the results in a list.
     * @param specs spec Single query spec to execute after expansion.
     * @returns Promise<[result]>
     */
    queryAll: (spec) =>
      valuesCache.resolve(specToExpansion(rootRef, valuesCache, spec)).then(saveFetched),

    /**
     * Get the latest currently loaded values for a timeseries. If no
     * values are loaded, this procedure returns an empty list.
     * @param ref string|ref The reference or pattern of ref
     * @returns [event]
     */
    current: (ref) =>
      saveFetched(
        valuesCache.getCurrentSlice(typeof ref === "string" ? match(rootRef, ref) : ref)
      ),

    /**
     * Runs a single query against the time series database, sorting
     * by timestamp ascending. This procedure skips cache and is meant
     * to be used in edge cases only.
     * @param ref string|ref The reference or pattern of ref
     * @param spec object The query object, in the same shape as that
     * of *series.query*
     * @returns Promise<[event]> The events matching the query, in
     * ascending order.
     */
    earliest: (ref, spec = {}) =>
      valuesCache
        .getEarliest(
          typeof ref === "string" ? match(rootRef, ref) : ref,
          spec.since,
          spec.until,
          spec.count,
          spec.tag,
          {...spec}
        )
        .then(saveFetched),

    /**
     * Schedules the insertion of an event in the currently
     * referenced time series.
     * @param value number The value for the event.
     * @param opts.timestamp string Timestamp for the event.
     * @param opts.coords object Coordinates for the event, an
     * object with x, y, and/or z properties
     * @param opts.label string Optional label to add to the event.
     * @param opts.meta object Optional aribitrary object to add as
     * non-queryable metadata.
     * @returns void
     */
    yield: (value, {timestamp = null, coords = null, label = null, meta = null} = {}) => {
      let normalizedValue = null;
      if (typeof value === "number" && isFinite(value)) {
        normalizedValue = value;
      } else if (typeof value === "boolean") {
        // perform a standard boolean-to-integer conversion
        normalizedValue = ~~value;
      } else {
        log.warn(`Received mistyped value ${value} (${typeof value})`, {
          messageId,
          timeseries,
        });
        return;
      }
      output.push({
        "value": normalizedValue,
        "name": rootRef.canonical_name,
        "@timestamp": timestamp === null ? timeframe.end : timestamp,
        "coords":
          coords === null || typeof coords !== "object"
            ? {}
            : {
                ...(typeof coords.x !== "undefined" ? {x: coords.x} : {}),
                ...(typeof coords.y !== "undefined" ? {y: coords.y} : {}),
                ...(typeof coords.z !== "undefined" ? {z: coords.z} : {}),
              },
        "sequence": saved++,
        "labels": [
          ...(rootRef.labels || []),
          ...(rootRef.script_version
            ? [{key: "script-version", value: rootRef.script_version}]
            : []),
          {key: "type", value: "derived"},
          ...(label
            ? [
                {
                  key: "enrichment-tag",
                  value: label,
                },
              ]
            : []),
        ],
        meta,
      });
    },

    /**
     * Gets a list of all the events fetched through this instance
     * of dependencies.
     * @returns [event]
     */
    fetched: () => [...fetchedEvents],
  };

  /**
   * Old save API, deprecated in favor of series.yield.
   */
  dependencies.series.save = (
    value,
    timestamp = null,
    coords = null,
    label = null,
    meta = null
  ) => {
    log.warn("series.save() is deprecated in favor of series.yield()", {
      messageId,
      timeseries,
    });
    return dependencies.series.yield(value, {timestamp, coords, label, meta});
  };

  // utilities
  dependencies.utils = {
    debug: (msg) => log.info(msg, {messageId, timeseries}),
    isDefined: (v) => typeof v !== "undefined" && v !== null,
    isUndefined: (v) => typeof v === "undefined" || v === null,
    assert: (v) => {
      if (typeof v === "undefined" || v === null) {
        throw new Error("utils.assert failed");
      }
      return v;
    },

    /**
     * Returns whether the given timestamp fits into the given interval.
     * @param ts string Timestamp to test.
     * @param from string Timestamp that starts the interval.
     * @param to string Timestamp that ends the interval.
     * @returns boolean
     */
    timestampInInterval: (ts, from, to) => {
      let inside = true;
      const time = new Date(ts).getTime();
      if (from.toLowerCase() !== "__bot__") {
        inside = time >= new Date(from).getTime();
      }
      if (to.toLowerCase() !== "__eot__") {
        inside = inside && time <= new Date(to).getTime();
      }
      return inside;
    },

    /**
     * Returns whether the given timestamps are equal according to the
     * given tolerance (in millis).
     * @param tsA string First timestamp.
     * @param tsB string Second timestamp.
     * @param tolerance number Tolerance value (0 by default).
     * @returns boolean
     */
    timestampEquals: (tsA, tsB, tolerance = 0) => {
      return Math.abs(new Date(tsA).getTime() - new Date(tsB).getTime()) <= tolerance;
    },

    /**
     * Various getter methods for slices of a timestamp.
     * @param ts string The timestamp, or the end of the timeframe by
     * default.
     * @returns string The piece of the timestamp
     */
    getYear: (ts = timeframe.end) => new Date(ts).toJSON().slice(0, 4),
    getMonth: (ts = timeframe.end) => new Date(ts).toJSON().slice(0, 7),
    getDay: (ts = timeframe.end) => new Date(ts).toJSON().slice(0, 10),
    getHour: (ts = timeframe.end) => new Date(ts).toJSON().slice(0, 13),
    getMinute: (ts = timeframe.end) => new Date(ts).toJSON().slice(0, 16),
    getSecond: (ts = timeframe.end) => new Date(ts).toJSON().slice(0, 19),

    /**
     * Returns a new timestamp that is the first one, moved to the past
     * by the specified number of years.
     * @param ts string Base timestamp.
     * @param years number The number of years to move to the past.
     * @returns string
     */
    yearsAgo: (ts, years) => moment.utc(ts).subtract(years, "years").toJSON(),

    /**
     * Returns a new timestamp that is the first one, moved to the past
     * by the specified number of months.
     * @param ts string Base timestamp.
     * @param months number The number of months to move to the past.
     * @returns string
     */
    monthsAgo: (ts, months) => moment.utc(ts).subtract(months, "months").toJSON(),

    /**
     * Returns a new timestamp that is the first one, moved to the past
     * by the specified number of days.
     * @param ts string Base timestamp.
     * @param days number The number of days to move to the past.
     * @returns string
     */
    daysAgo: (ts, days) => moment.utc(ts).subtract(days, "days").toJSON(),

    /**
     * Returns a new timestamp that is the first one, moved to the
     * past by the specified number of minutes.
     * @param ts string Base timestamp.
     * @param minutes number The number of minutes to move to the
     * past.
     * @returns string
     */
    minutesAgo: (ts, minutes) => moment.utc(ts).subtract(minutes, "minutes").toJSON(),

    /**
     * Returns a new timestamp that is the first one, moved to the
     * past by the specified number of seconds.
     * @param ts string Base timestamp.
     * @param minutes number The number of seconds to move to the
     * past.
     * @returns string
     */
    secondsAgo: (ts, seconds) => moment.utc(ts).subtract(seconds, "seconds").toJSON(),

    /**
     * Returns the amount of years of difference between two
     * timestamps, the first one being ahead (positive difference) of
     * the second.
     * @param ts1 string First timestamp.
     * @param ts2 string Second timestamp.
     * @returns number The number of years between both timestamps.
     */
    diffInYears: (ts1, ts2) => moment.utc(ts1).diff(moment.utc(ts2), "years", true),

    /**
     * Returns the amount of months of difference between two
     * timestamps, the first one being ahead (positive difference) of
     * the second.
     * @param ts1 string First timestamp.
     * @param ts2 string Second timestamp.
     * @returns number The number of months between both timestamps.
     */
    diffInMonths: (ts1, ts2) => moment.utc(ts1).diff(moment.utc(ts2), "months", true),

    /**
     * Returns the amount of days of difference between two
     * timestamps, the first one being ahead (positive difference) of
     * the second.
     * @param ts1 string First timestamp.
     * @param ts2 string Second timestamp.
     * @returns number The number of days between both timestamps.
     */
    diffInDays: (ts1, ts2) => moment.utc(ts1).diff(moment.utc(ts2), "days", true),

    /**
     * Returns the amount of minutes of difference between two
     * timestamps, the first one being ahead (positive difference) of
     * the second.
     * @param ts1 string First timestamp.
     * @param ts2 string Second timestamp.
     * @returns number The number of minutes between both timestamps.
     */
    diffInMinutes: (ts1, ts2) => moment.utc(ts1).diff(moment.utc(ts2), "minutes", true),

    /**
     * Returns the amount of seconds of difference between two
     * timestamps, the first one being ahead (positive difference) of
     * the second.
     * @param ts1 string First timestamp.
     * @param ts2 string Second timestamp.
     * @returns number The number of seconds between both timestamps.
     */
    diffInSeconds: (ts1, ts2) => moment.utc(ts1).diff(moment.utc(ts2), "seconds", true),

    /**
     * Invoke stats functions, isolated in a specialized separate
     * service.
     * @param path string The unique path to the function to invoke
     * @param args object Whatever arguments required by the function,
     * encoded in a plain object
     * @returns Promise<any>
     */
    stats: (path, args) => stats.invoke(path, args),

    /**
     * Compute the distance in meters between two georeferenced
     * objects.
     * @param p1 object An object with a coords property
     * @param p2 object An object with a coords property
     * @returns Promise<number|null>
     */
    distance: (p1, p2) => refsCache.distance(p1, p2),

    /**
     * Returns the date equivalent of the parameter timestamp.
     * @param timestamp number of timestamp.
     * @returns string The date converted from a timestamp.
     */
    unixTimestampToDate: (timestamp) => moment.unix(timestamp).utc().toJSON(),

    /**
     * Returns the timestamp equivalent of the parameter date.
     * @param date string of date.
     * @returns number The timestamp converted from a date.
     */
    dateToUnixTimestamp: (date) => moment.utc(date).unix(),

    /**
     * Returns the boolean True if the first parameter is after to teh second
     * parameter.
     * @param timestamp1 string First timestamp.
     * @param timestamp2 string Second timestamp.
     * @returns boolean
     */
    isAfter: (timestamp1, timestamp2) => moment.utc(timestamp1).isAfter(timestamp2),

    /**
     * Returns the boolean True if the first parameter is before to the second
     * parameter.
     * @param timestamp1 string First timestamp.
     * @param timestamp2 string Second timestamp.
     * @returns boolean
     */
    isBefore: (timestamp1, timestamp2) => moment.utc(timestamp1).isBefore(timestamp2),
  };

  return dependencies;
};

module.exports.hollowDependencies = module.exports.makeDependencies({
  messageId: "<none>",
  log: null,
  stats: null,
  refsCache: null,
  valuesCache: null,
  timeframe: {},
  rootRef: {},
  output: null,
});
