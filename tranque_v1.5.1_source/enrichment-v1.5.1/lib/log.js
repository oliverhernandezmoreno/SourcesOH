const Raven = require("raven");
const winston = require("winston");
const Elasticsearch = require("winston-elasticsearch");

const conf = require("./conf");

const logger = winston.createLogger({
  level: conf.LOG_LEVEL,
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    ...(conf.LOGS_TO_ELASTICSEARCH
      ? [new Elasticsearch({clientOpts: {node: conf.ELASTICSEARCH_NODE}})]
      : []),
  ],
});

exports.logger = logger;

const SENTRY_LEVELS = {
  silly: "debug",
  debug: "debug",
  verbose: "debug",
  http: "info",
  info: "info",
  warn: "warning",
  error: "error",
};

const RAVEN_ENABLED = conf.SENTRY_DSN !== null && conf.NODE_ENV !== "test";

const logMethod = (method) => (message, ...extra) => {
  if (RAVEN_ENABLED) {
    Raven.captureBreadcrumb({
      message,
      data: extra
        .filter((piece) => typeof piece === "object")
        .map((piece) =>
          Object.entries(piece).reduce((acc, [k, v]) => ({...acc, [k]: v}), {})
        )
        .reduce((acc, partial) => ({...acc, ...partial}), {}),
      category: method,
      level: SENTRY_LEVELS[method],
    });
  }
  return logger[method](message, ...extra);
};

exports.silly = logMethod("silly");
exports.debug = logMethod("debug");
exports.verbose = logMethod("verbose");
exports.http = logMethod("http");
exports.info = logMethod("info");
exports.warn = logMethod("warn");
exports.error = logMethod("error");
exports.exception = (err, ...extra) => {
  const $ = exports.error(err.toString(), ...[...extra, err]);
  if (RAVEN_ENABLED) {
    Raven.captureException(err);
  }
  return $;
};

exports.context = (fn) => (RAVEN_ENABLED ? Raven.context(fn) : fn());

if (RAVEN_ENABLED) {
  Raven.config(conf.SENTRY_DSN, {
    release: conf.COMMIT,
  }).install();
}

// eslint-disable-next-line
exports.trace = console.log.bind(console);
