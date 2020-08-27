/**
 * For use in Array.prototype.sort of events, to sort by their
 * "@timestamp" key.
 */
const byTimestamp = (asc) => (ev1, ev2) => {
  const ts1 = new Date(ev1["@timestamp"]).getTime();
  const ts2 = new Date(ev2["@timestamp"]).getTime();
  if (ts1 < ts2) {
    return asc ? -1 : 1;
  } else if (ts1 === ts2) {
    return 0;
  } else {
    return asc ? 1 : -1;
  }
};

/**
 * Returns whether two events are probably the same one.
 */
const eqEvents = (ev1, ev2) => {
  if (typeof ev1._id !== "undefined" && typeof ev2._id !== "undefined") {
    return ev1._id === ev2._id;
  }
  if (ev1.value !== ev2.value) {
    return false;
  }
  if (ev1.name !== ev2.name) {
    return false;
  }
  if (new Date(ev1["@timestamp"]).getTime() !== new Date(ev2["@timestamp"]).getTime()) {
    return false;
  }
  if ((ev1.coords && !ev2.coords) || (!ev1.coords && ev2.coords)) {
    return false;
  }
  if (
    ev1.coords &&
    (ev1.coords.x !== ev2.coords.x ||
      ev1.coords.y !== ev2.coords.y ||
      ev1.coords.z !== ev2.coords.z)
  ) {
    return false;
  }
  if (ev1.sequence !== ev2.sequence) {
    return false;
  }
  return true;
};

/**
 * Inserts event into collection, only if it's not there.
 */
const insertEvent = (event, col) => {
  const insertIndex = col.findIndex((e) => e["@timestamp"] <= event["@timestamp"]);
  if (insertIndex === -1) {
    return [...col, event];
  }
  const candidates = col
    .slice(insertIndex)
    .filter((e) => e["@timestamp"] === event["@timestamp"]);
  const init = col.slice(0, insertIndex);
  const tail = col.slice(insertIndex + candidates.length);
  return [
    ...init,
    ...(candidates.some((e) => eqEvents(e, event)) ? [] : [event]),
    ...candidates,
    ...tail,
  ];
};

/**
 * Returns a collection of events from both lists, preserving the
 * events in the second list when duplicates are found.
 */
const mergeEventLists = (col1, col2) =>
  col1.reduce((acc, e) => insertEvent(e, acc), col2);

/**
 * A predicate for events that looks for the given tag in the labels.
 */
const eventHasTag = (tag) => (event) =>
  (event.labels || []).some(({key, value}) => key === "enrichment-tag" && value === tag);

/**
 * A predicate for events with values matching some combination of
 * value filters.
 */
const eventValueMatches = (range) => (event) =>
  (typeof range.valueEq === "number" ? event.value === range.valueEq : true) &&
  (typeof range.valueGt === "number" ? event.value > range.valueGt : true) &&
  (typeof range.valueLt === "number" ? event.value < range.valueLt : true) &&
  (typeof range.valueGte === "number" ? event.value >= range.valueGte : true) &&
  (typeof range.valueLte === "number" ? event.value <= range.valueLte : true);

/**
 * A pass-all predicate.
 */
const pass = () => true;

/**
 * Adds a mark to the event to distinguish it from non-cached events.
 */
const markCached = (event) => ({...event, _cached: true});

/**
 * Sorts the given object properties to enable stable serialization.
 */
const sortObject = (obj) => {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(sortObject);
  }
  return Object.entries(obj)
    .sort(([k1], [k2]) => k1.localeCompare(k2))
    .reduce((acc, [k, v]) => ({...acc, [k]: sortObject(v)}), {});
};

/**
 * Generates a unique hashing for the given object, using predictable
 * JSON serialization.
 */
const hashObject = (obj) => JSON.stringify(sortObject(obj));

/**
 * The maximum events that may be fetched in a single query.
 */
const MAX_EVENTS_FETCHED = 1000;

/**
 * The default events quantity to fetch in a query.
 */
const DEFAULT_EVENTS_COUNT = 20;

/**
 * The interface to access the Elasticsearch database. It uses a cache
 * to store previously available events and not query them again when
 * requested by some script.
 */
class ValuesCache {
  /**
   * Builds the cache.
   * @param maxTimestamp <Timestamp> The maximum timestamp value to
   *        allow in this cache.
   * @param initial <Array<Event>> The initial event collection for
   *        this cache.
   * @param timeseries <module> The timeseries module to access
   *        Elasticsearch.
   * @param messageId <string> The id of the message that triggered
   *        execution.
   */
  constructor(maxTimestamp, initial, timeseries, messageId) {
    this.maxTimestamp = maxTimestamp;
    this.timeseries = timeseries;
    this.messageId = messageId;
    // Values coming from the message *or* indexed by scripts
    this.values = initial
      .slice()
      .sort(byTimestamp(false))
      .reduce(
        (acc, event) => ({
          ...acc,
          [event.name]: [...(acc[event.name] || []), markCached(event)],
        }),
        {}
      );
    // Queries previously executed
    this.queriesCatalog = {};
  }

  /**
   * Builds a query object given the spec parameters.
   * @param ref <Ref> The reference, either a string or a reference
   *        proper.
   * @param size <number> The size to use for the query (i.e. the max
   *        amount of events to fetch)
   * @param filters <Array<Filter>> The array of filters to use for
   *        the Elasticsearch query.
   * @param mapper <Function<Array<Event>, Array<Event>>> A function
   *        used to extract values from the resulting collection.
   * @returns <Query> The query object.
   */
  makeQuery({ref, size, filters, mapper}) {
    return {
      ref: typeof ref === "string" ? {canonical_name: ref} : ref,
      size,
      filters,
      mapper,
    };
  }

  /**
   * Runs a list of queries against Elasticsearch, using the cache to
   * not re-run queries previously executed.
   * @param queries <Array<Query>> The queries to run.
   * @returns <Promise<Array<Array<Event>>>> The async results.
   */
  async runQuery(queries, sort = "desc") {
    if (queries.length === 0) {
      return [];
    }
    const queryBodies = queries.map(({ref, size, filters}) => ({
      from: 0,
      size,
      query: {
        bool: {
          filter: [
            {term: {name: ref.canonical_name}},
            {range: {"@timestamp": {lte: this.maxTimestamp}}},
            ...filters,
          ],
        },
      },
      sort: [{"@timestamp": sort}],
    }));
    const hashedQueries = queryBodies.map((query) => ({query, key: hashObject(query)}));
    hashedQueries.forEach(({key}) => {
      if (typeof this.queriesCatalog[key] !== "undefined") {
        this.queriesCatalog[key] = this.queriesCatalog[key].map(markCached);
      }
    });
    const newQueries = hashedQueries.filter(
      ({key}) => typeof this.queriesCatalog[key] === "undefined"
    );
    if (newQueries.length > 0) {
      const body = newQueries
        .map(({query}) => query)
        .flatMap((queryBody) => [{index: "derived-*"}, queryBody]);
      const {responses} = await this.timeseries.client.msearch({body});
      const results = responses.map((response) =>
        response.hits.hits.map((hit) => ({...hit._source, _id: hit._id}))
      );
      results.forEach((result, index) => {
        this.queriesCatalog[newQueries[index].key] = result;
      });
    }
    return hashedQueries.map(({key}) => this.queriesCatalog[key]);
  }

  /**
   * Resolves a list of queries against cache and Elasticsearch. This
   * is the main procedure of the class.
   * @param queries <Array<Query>> The queries list, built with
   *        makeQuery.
   * @returns <Promise<Array<Array<Event>>>> The async results.
   */
  async resolve(queries) {
    // run all queries
    const data = await this.runQuery(queries);
    // merge results with cached values, and run them through the mapper
    return data
      .map((results, index) => ({results, query: queries[index]}))
      .map(({results, query}) => ({
        results: mergeEventLists(results, this.values[query.ref.canonical_name] || []),
        query,
      }))
      .map(({results, query}) => query.mapper(results));
  }

  /**
   * Builds a tag filter for Elasticsearch, from the specified tag.
   * @param tag <string> The tag
   * @return <Filter> The filter object.
   */
  tagFilter(tag) {
    return {
      nested: {
        path: "labels",
        score_mode: "none",
        query: {
          bool: {
            filter: [
              {term: {"labels.key": "enrichment-tag"}},
              {term: {"labels.value": tag}},
            ],
          },
        },
      },
    };
  }

  /**
   * Determines whether a value range object represents a non-null
   * value filter.
   * @param valueRange <object> The value range object.
   * @return <bool>
   */
  isValueFilter(valueRange) {
    return !(
      valueRange === null ||
      typeof valueRange === "undefined" ||
      typeof valueRange !== "object" ||
      (typeof valueRange.valueEq !== "number" &&
        typeof valueRange.valueGt !== "number" &&
        typeof valueRange.valueLt !== "number" &&
        typeof valueRange.valueGte !== "number" &&
        typeof valueRange.valueLte !== "number")
    );
  }

  /**
   * Builds a list of value filters for Elasticsearch, from the
   * specified value range object.
   * @param valueRange <object> The value range object.
   * @return <[Filter]> The filter objects.
   */
  valueFilters(valueRange) {
    return [
      typeof valueRange.valueEq === "number" ? {term: {value: valueRange.valueEq}} : null,
      typeof valueRange.valueGt === "number"
        ? {range: {value: {gt: valueRange.valueGt}}}
        : null,
      typeof valueRange.valueLt === "number"
        ? {range: {value: {lt: valueRange.valueLt}}}
        : null,
      typeof valueRange.valueGte === "number"
        ? {range: {value: {gte: valueRange.valueGte}}}
        : null,
      typeof valueRange.valueLte === "number"
        ? {range: {value: {lte: valueRange.valueLte}}}
        : null,
    ].filter((f) => f !== null);
  }

  /**
   * Builds a 'head' query, a query for the latest event.
   * @param ref <Ref> The reference.
   * @param tag <string> An optional tag to filter within the events.
   * @param valueRange <object> An optional object with value filters.
   * @param valueRange.valueEq <number> An optional value equality filter.
   * @param valueRange.valueGt <number> An optional value inequality '>' filter.
   * @param valueRange.valueLt <number> An optional value inequality '<' filter.
   * @param valueRange.valueGte <number> An optional value inequality '>=' filter.
   * @param valueRange.valueLte <number> An optional value inequality '<=' filter.
   * @param all <bool> Whether to return all head events (defaults to false).
   * @returns <Query> A query object.
   */
  head(ref, tag = null, valueRange = null, all = null) {
    const isValueFilter = this.isValueFilter(valueRange);
    return this.makeQuery({
      ref,
      size: all ? MAX_EVENTS_FETCHED : 1,
      filters: [
        ...(tag ? [this.tagFilter(tag)] : []),
        ...(isValueFilter ? this.valueFilters(valueRange) : []),
      ],
      mapper: (data) => {
        const mapped = data
          .filter(tag ? eventHasTag(tag) : pass)
          .filter(isValueFilter ? eventValueMatches(valueRange) : pass);
        if (!all) {
          return mapped[0];
        }
        if (mapped.length === 0) {
          return mapped;
        }
        const timestamp = new Date(mapped[0]["@timestamp"]).getTime();
        return mapped.filter((e) => new Date(e["@timestamp"]).getTime() === timestamp);
      },
    });
  }

  /**
   * Builds a simple 'slice' query, a query for the latest slice of
   * events.
   * @param ref <Ref> The reference.
   * @param count <number> The max amount of events.
   * @param tag <string> An optional tag to filter within the events.
   * @param valueRange <object> An optional object with value filters.
   * @param valueRange.valueEq <number> An optional value equality filter.
   * @param valueRange.valueGt <number> An optional value inequality '>' filter.
   * @param valueRange.valueLt <number> An optional value inequality '<' filter.
   * @param valueRange.valueGte <number> An optional value inequality '>=' filter.
   * @param valueRange.valueLte <number> An optional value inequality '<=' filter.
   * @returns <Query> A query object.
   */
  slice(ref, count = DEFAULT_EVENTS_COUNT, tag = null, valueRange = null) {
    const isValueFilter = this.isValueFilter(valueRange);
    return this.makeQuery({
      ref,
      size: count,
      filters: [
        ...(tag ? [this.tagFilter(tag)] : []),
        ...(isValueFilter ? this.valueFilters(valueRange) : []),
      ],
      mapper: (data) =>
        data
          .filter(tag ? eventHasTag(tag) : pass)
          .filter(isValueFilter ? eventValueMatches(valueRange) : pass)
          .slice(0, count),
    });
  }

  /**
   * Builds a complex 'slice' query, a query for a particular slice of
   * events placed anywhere in the time line.
   * @param ref <Ref> The reference.
   * @param since <Timestamp> The timestamp to use as the oldest.
   * @param until <Timestamp> The timestamp to use as the newest.
   * @param count <number> The max amount of events.
   * @param tag <string> An optional tag to filter within the events.
   * @param valueRange <object> An optional object with value filters.
   * @param valueRange.valueEq <number> An optional value equality filter.
   * @param valueRange.valueGt <number> An optional value inequality '>' filter.
   * @param valueRange.valueLt <number> An optional value inequality '<' filter.
   * @param valueRange.valueGte <number> An optional value inequality '>=' filter.
   * @param valueRange.valueLte <number> An optional value inequality '<=' filter.
   * @returns <Query> A query object.
   */
  sliceSinceUntil(
    ref,
    since = null,
    until = null,
    count = MAX_EVENTS_FETCHED,
    tag = null,
    valueRange = null
  ) {
    const isValueFilter = this.isValueFilter(valueRange);
    return this.makeQuery({
      ref,
      size: count,
      filters: [
        ...[
          [since, {range: {"@timestamp": {gte: since}}}],
          [until, {range: {"@timestamp": {lte: until}}}],
        ]
          .filter(([ts]) => ts !== null)
          .map(([_, filter]) => filter),
        ...(tag ? [this.tagFilter(tag)] : []),
        ...(isValueFilter ? this.valueFilters(valueRange) : []),
      ],
      mapper: (data) =>
        data
          .filter(tag ? eventHasTag(tag) : pass)
          .filter(isValueFilter ? eventValueMatches(valueRange) : pass)
          .filter((event) => (since !== null ? event["@timestamp"] >= since : true))
          .filter((event) => (until !== null ? event["@timestamp"] <= until : true))
          .slice(0, count),
    });
  }

  /**
   * Returns the current slice in cache for the given reference.
   * @param variant <Ref> The reference.
   * @return <Array<Event>> The events in cache.
   */
  getCurrentSlice(variant) {
    const {ref} = this.makeQuery({ref: variant});
    return this.values[ref.canonical_name] || [];
  }

  /**
   * Returns the result of running a query much like sliceSinceUntil,
   * but reversing the order. This procedure won't ever hit the cache
   * or feed it in any way. The returned array is sorted from earliest
   * to latest.
   * @returns <Promise<Array<Event>>> The async results.
   */
  async getEarliest(
    variant,
    since = null,
    until = null,
    count = DEFAULT_EVENTS_COUNT,
    tag = null,
    valueRange = null
  ) {
    const isValueFilter = this.isValueFilter(valueRange);
    const query = this.makeQuery({
      ref: variant,
      size: count,
      filters: [
        ...[
          [since, {range: {"@timestamp": {gte: since}}}],
          [until, {range: {"@timestamp": {lte: until}}}],
        ]
          .filter(([ts]) => ts !== null)
          .map(([_, filter]) => filter),
        ...(tag ? [this.tagFilter(tag)] : []),
        ...(isValueFilter ? this.valueFilters(valueRange) : []),
      ],
    });
    // Resolve the query directly (don't check or feed the cache)
    const [result] = await this.runQuery([query], "asc");
    return result;
  }

  /**
   * Creates an entry in cache for the given reference.
   * @param ref <Ref> The reference.
   */
  touch(ref) {
    this.values[ref.canonical_name] = this.values[ref.canonical_name] || [];
  }

  /**
   * Bulk-indexes the given events.
   * @param events <Array<Event>> The events to index.
   * @param trace <Array<string>> The trace of event ids used to track
   * dependencies.
   * @returns <Promise<Array<Event>>> The async operation returning
   * the events persisted.
   */
  async index(events, trace = []) {
    const saved = await this.timeseries.saveEvents(events, this.messageId, trace);
    saved.sort(byTimestamp(true)).forEach((event) => {
      this.values[event.name] = [markCached(event), ...(this.values[event.name] || [])];
    });
    Object.keys(this.values).forEach((key) => {
      this.values[key] = this.values[key].sort(byTimestamp(false));
    });
    return saved;
  }
}

module.exports.ValuesCache = ValuesCache;
