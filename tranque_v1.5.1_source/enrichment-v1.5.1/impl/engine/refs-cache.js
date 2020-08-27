/**
 * Adds a cache mark to the given object.
 */
const markCached = (obj) => ({...obj, _cached: true});

/**
 * The interface to access the Postgres database. It uses a cache to
 * store previously available references and not query them again when
 * requested by some script.
 */
class RefsCache {
  /**
   * Builds the cache.
   * @param maxTimestamp <Timestamp> The maximum timestamp value used
   *        for protocol acquisition.
   * @param backend <module> The backend module to access Postgres.
   */
  constructor(maxTimestamp, backend) {
    this.maxTimestamp = maxTimestamp;
    this.backend = backend;
    this.refs = {}; // a mapping from canonical_name -> timeseries
    this.parameters = {}; // a nested mapping: target_id -> { parameter name -> parameter }
  }

  /**
   * Fetches a reference (a timeseries object) by canonical name.
   * @param name <string> The reference's canonical_name.
   * @returns <Promise<Ref>> The async reference.
   */
  async get(name) {
    if (typeof this.refs[name] !== "undefined") {
      return this.refs[name];
    }
    const [ts] = await this.backend.timeseries([name]);
    this.refs[name] = markCached(ts);
    return ts;
  }

  /**
   * Fetches several references by canonical name.
   * @param names <Array<string>> The reference's canonical_name(s).
   * @returns <Promise<Array<Ref>>> The async references.
   */
  async getMany(names) {
    if (names.length === 0) {
      return [];
    }
    const missing = names.filter((name) => typeof this.refs[name] === "undefined");
    if (missing.length === 0) {
      return names.map((name) => this.refs[name]);
    }
    await this.backend.timeseries(missing).then((results) =>
      missing.forEach((name) => {
        const found = results.find((ref) => ref.canonical_name === name);
        if (!found) {
          throw new Error(`ref ${name} not found`);
        }
        this.refs[name] = markCached(found);
      })
    );
    return names.map((name) => this.refs[name]);
  }

  /**
   * Fetches the execution plans for the given list of reference names.
   * @param names <Array<string>> The reference's canonical_name(s).
   * @returns <Promise<Array<Array<string>>>> The async execution
   *          plans, each plan being an array of canonical names.
   */
  async getPlans(names) {
    if (names.length === 0) {
      return [];
    }
    return this.backend.plans(names);
  }

  /**
   * Executes the protocol acquisition procedure for the given time
   * series.
   * @param name <string> The reference canonical name.
   * @param protocol <string> The protocol identifier
   * @param meta <object> Anything used to store alongside the
   *        protocol acquisition.
   * @param decider <Function<object, bool>> A function used to decide
   *        on the protocol acquisition in moments of conflict. The
   *        function will get a previous acquisition object (if at
   *        all) and should return true if it needs to override the
   *        given acquisition.
   * @returns <Promise<bool>> The async result of the acquisition
   *          operation.
   */
  async acquireProtocol(name, protocol, meta, decider) {
    const acquired = await this.backend.acquireProtocol(
      name,
      protocol,
      this.maxTimestamp,
      meta,
      (ap) =>
        decider({
          created_at: ap.created_at.toJSON(),
          timeseries: name,
          protocol: ap.protocol_id,
          meta: ap.meta,
        })
    );
    return acquired !== null;
  }

  /**
   * Get a single parameter associated with the given reference and
   * the specified parameter name, or null if none is found.
   * @param ref Ref The time series reference
   * @param name string The name of the parameter
   * @return Promise<Parameter|null>
   */
  async getParameter(ref, name) {
    // if the ref is a proper reference, the parameters cache may be
    // used
    if (
      typeof ref === "object" &&
      ref.target &&
      (this.parameters[ref.target.id] || {})[name]
    ) {
      return this.parameters[ref.target.id][name];
    }
    const parameters = await this.backend.parameters(
      typeof ref === "string" ? ref : ref.canonical_name,
      name
    );
    if (parameters.length === 0) {
      return null;
    }
    // if the ref is a proper reference, the parameters cache may be
    // fed with the found parameter
    if (typeof ref === "object" && ref.target) {
      this.parameters[ref.target.id] = this.parameters[ref.target.id] || {};
      this.parameters[ref.target.id][name] = markCached(parameters[0]);
    }
    return parameters[0];
  }

  /**
   * Computes the distance between two geo-referenced objects, in
   * meters.
   * @param p1 object An object with a coords property
   * @param p2 object An object with a coords property
   * @returns Promise<number|null>
   */
  async distance(p1, p2) {
    return this.backend.distance(p1, p2);
  }
}

module.exports.RefsCache = RefsCache;
