const crypto = require("crypto");
const {
  packagedDependencies: {timeseries},
} = require("./handler");

module.exports.indexMany = (events) =>
  timeseries.saveEvents(
    events.map((event) => ({
      "name": null,
      "value": null,
      "coords": {},
      "@timestamp": new Date().toJSON(),
      "labels": [],
      ...event,
    }))
  );

module.exports.search = (name, count) =>
  timeseries.client
    .search({
      index: "derived-*",
      body: {
        from: 0,
        size: count || 50,
        query: {term: {name}},
        sort: [{"@timestamp": "desc"}],
      },
    })
    .then((response) =>
      response.hits.hits.map((hit) => ({...hit._source, _id: hit._id}))
    );

module.exports.genName = () => {
  const name = crypto
    .randomBytes(15)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  return `test.${name}`;
};

module.exports.makeEvent = (name, timestamp, tag, meta) => (value) => ({
  "name": name,
  "@timestamp": timestamp || new Date().toJSON(),
  "value": value,
  "labels": tag ? [{key: "enrichment-tag", value: tag}] : [],
  "meta": meta ? meta : null,
});
