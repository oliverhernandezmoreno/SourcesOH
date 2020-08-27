const express = require("express");
const request = require("request");


const PORT = 8000;
const CATALOG_EXPIRATION_THRESHOLD = parseInt(process.env["CATALOG_EXPIRATION_THRESHOLD"] || "900000", 10);
const WINDOW_SIZE = parseInt(process.env["WINDOW_SIZE"] || "1", 10);
const NAME_PATTERN = process.env["NAME_PATTERN"] || ".*";
const ELASTICSEARCH_HOST = process.env["ELASTICSEARCH_HOST"] || "localhost";
const ELASTICSEARCH_PORT = parseInt(process.env["ELASTICSEARCH_PORT"] || "9200", 10);
const STACK_ENVIRONMENT = process.env["STACK_ENVIRONMENT"] || "dev";

const server = express();
server.set("env", "production");
server.set("x-powered-by", false);

const esQuery = (path, body) => new Promise((resolve, reject) => {
  console.log("Elasticsearch query to", path);
  request({
    headers: {"Content-Type": "application/json"},
    method: "POST",
    uri: `http://${ELASTICSEARCH_HOST}:${ELASTICSEARCH_PORT}/${path}`,
    body: Array.isArray(body) ?
      body.map((line) => JSON.stringify(line)).join("\n") + "\n" :
      JSON.stringify(body),
  }, (err, response, body) => {
    if (err) {
      console.error("Request error", err);
      return reject(err);
    }
    if (response.statusCode >= 400) {
      console.error("Response error", body);
      return reject(new Error(`response status ${response.statusCode}`));
    }
    try {
      return resolve(JSON.parse(body));
    } catch (parseErr) {
      return reject(parseErr);
    }
  });
});

const tsCatalog = new (class TsCatalog {
  constructor(expirationThreshold) {
    this.expirationThreshold = expirationThreshold;
    this.fetched = null;
    this.data = null;
  }

  shouldFetch() {
    const now = (new Date()).getTime();
    return this.data === null ||
      this.fetched === null ||
      (now - this.fetched) > this.expirationThreshold;
  }

  fetch() {
    return esQuery("raw-*/_search", {
      size: 0,
      query: {regexp: {name: NAME_PATTERN}},
      aggs: {uniq_name: {terms: {field: "name"}}}
    })
      .then((body) => {
        this.data = typeof body.aggregations === "undefined" ?
          [] :
          body.aggregations.uniq_name.buckets.map(({key}) => key);
        this.fetched = (new Date()).getTime();
        return null;
      });
  }

  resolve() {
    return (this.shouldFetch() ? this.fetch() : Promise.resolve(null))
      .then(() => this.data);
  }
})(CATALOG_EXPIRATION_THRESHOLD);

const probe = (names) => names.length === 0 ?
      Promise.resolve([]) :
      esQuery(
        "raw-*/_msearch",
        names
          .map((name) => ({
            from: 0,
            size: WINDOW_SIZE,
            _source: "@timestamp",
            query: {term: {name}},
            sort: [{"@timestamp": "desc"}],
          }))
          .map((query) => [{}, query])
          .reduce((flat, nested) => [...flat, ...nested], []),
      )
      .then(({responses}) => names.map((name, index) => ({
        name,
        timestamps: responses[index].hits.hits.map(({_source}) => _source["@timestamp"]),
      })));

const metrics = (timestamps) => {
  if (timestamps.length === 0) {
    return null;
  }
  const now = (new Date()).getTime() / 1000;
  const times = timestamps.map((ts) => (new Date(ts)).getTime() / 1000);
  const age = now - times[0];
  return {age};
};

const prometheusMetrics = {
  age: {
    name: "timeseries_last_event_age_seconds",
    type: "gauge",
    help: "The age of the last event received",
  },
};

const buildPrometheusMetrics = (groups) => {
  const groupedMetrics = groups
        .map(({name, timestamps}) => ({name, metrics: metrics(timestamps)}))
        .filter(({metrics}) => metrics !== null)
        .reduce((grouped, {name, metrics}) => ({
          ...grouped,
          ...Object.entries(metrics)
            .reduce((acc, [metricName, value]) => ({
              ...acc,
              [metricName]: [...(grouped[metricName] || []), {name, value}]
            }), {}),
        }), {});
  return Object.entries(groupedMetrics)
    .map(([metric, values]) => [
      `# HELP ${prometheusMetrics[metric].name} ${prometheusMetrics[metric].help}`,
      `# TYPE ${prometheusMetrics[metric].name} ${prometheusMetrics[metric].type}`,
      ...values.map(({name, value}) => `${prometheusMetrics[metric].name}{name="${name}",env="${STACK_ENVIRONMENT}"} ${value}`),
      "",
    ].join("\n"))
    .join("\n");
};

server.get("*", (req, res) => {
  tsCatalog
    .resolve()
    .then((names) => probe(names))
    .then(buildPrometheusMetrics)
    .then((body) => res.type("text/plain; version=0.0.4").end(body))
    .catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
});

server.use((req, res) => {
  res.sendStatus(405);
});

module.exports = {
  esQuery,
  tsCatalog,
  probe,
  metrics,
  buildPrometheusMetrics,
  server,
};

if (require.main === module) {
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Started ts-stats exporter at port ${PORT}`);
  });
}
