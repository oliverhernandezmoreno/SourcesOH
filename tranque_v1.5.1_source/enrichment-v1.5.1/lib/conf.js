const fs = require("fs");
const path = require("path");
const winston = require("winston");

const env = (key, absent = null) => {
  return Object.keys(process.env).indexOf(key) === -1 ? absent : process.env[key];
};

exports.env = env;

// General

exports.NODE_ENV = env("NODE_ENV");

exports.BASE_DIR = path.dirname(__dirname);

exports.LOG_LEVEL = ((level) =>
  typeof winston.config.npm.levels[level] === "undefined" ? "info" : level)(
  env("LOG_LEVEL", exports.NODE_ENV === "test" ? "error" : "info")
);

let branch = null;
let commit = null;
try {
  const head = fs
    .readFileSync(path.join(exports.BASE_DIR, ".git", "HEAD"))
    .toString()
    .trim();
  if (!head.startsWith("ref: ")) {
    commit = head;
  } else {
    branch = head.split("/").reverse()[0];
    commit = fs
      .readFileSync(path.join(exports.BASE_DIR, ".git", head.split(" ")[1]))
      .toString()
      .trim();
  }
} catch (_) {
  // pass
}
exports.BRANCH = branch;
exports.COMMIT = commit;

exports.NAMESPACE = env("NAMESPACE", "global-namespace");

exports.SENTRY_DSN = env("ENRICHMENT_SENTRY_DSN");

exports.LOGS_TO_ELASTICSEARCH = env("ENRICHMENT_LOGS_TO_ELASTICSEARCH", "0") === "1";

// RabbitMQ

exports.AMQP_HOST = env("AMQP_HOST", "localhost");

exports.AMQP_PORT = env("AMQP_PORT", "5672");

exports.AMQP_USERNAME = env("AMQP_USERNAME", "guest");

exports.AMQP_PASSWORD = env("AMQP_PASSWORD", "guest");

exports.AMQP_VHOST = env("AMQP_VHOST", "/");

exports.AMQP_SSL = env("AMQP_SSL", "0") === "1";

exports.AMQP_EXCHANGE = env("AMQP_EXCHANGE", "enrichment");

exports.AMQP_FEDERATED_EXCHANGE = `federated.${exports.NAMESPACE}`;

exports.AMQP_TOPIC = env("AMQP_TOPIC", "#");

exports.AMQP_QUEUE = env("AMQP_QUEUE");

exports.AMQP_PREFETCH = parseInt(env("AMQP_PREFETCH", "1"), 10);

exports.AMQP_CONNECTION_TIMEOUT = parseInt(env("AMQP_CONNECTION_TIMEOUT", "30000"), 10);

exports.AMQP_MESSAGE_TTL = parseInt(env("AMQP_MESSAGE_TTL", `${5 * 60 * 60 * 1000}`), 10);

exports.AMQP_QUEUE_TTL = parseInt(env("AMQP_QUEUE_TTL", `${24 * 60 * 60 * 1000}`), 10);

// ElasticSearch

exports.ELASTICSEARCH_PROTOCOL = env("ELASTICSEARCH_PROTOCOL", "http");

exports.ELASTICSEARCH_HOST = env("ELASTICSEARCH_HOST", "localhost");

exports.ELASTICSEARCH_PORT = env("ELASTICSEARCH_PORT", "9200");

exports.ELASTICSEARCH_USER = env("ELASTICSEARCH_USER");

exports.ELASTICSEARCH_PASSWORD = env("ELASTICSEARCH_PASSWORD");

exports.ELASTICSEARCH_NODE = [
  exports.ELASTICSEARCH_PROTOCOL,
  "://",
  ...(exports.ELASTICSEARCH_USER
    ? [exports.ELASTICSEARCH_USER, ":", exports.ELASTICSEARCH_PASSWORD || "", "@"]
    : []),
  exports.ELASTICSEARCH_HOST,
  ":",
  exports.ELASTICSEARCH_PORT,
].join("");

// Postgres

exports.DATABASE_HOST = env("DATABASE_HOST", "localhost");

exports.DATABASE_PORT = parseInt(env("DATABASE_PORT", "5432"), 10);

exports.DATABASE_NAME = env("DATABASE_NAME", "backend");

exports.DATABASE_USER = env("DATABASE_USER", "backend");

exports.DATABASE_PASSWORD = env("DATABASE_PASSWORD", "backend");

// Stats

exports.STATS_HOST = env("STATS_HOST", "localhost");

exports.STATS_PORT = parseInt(env("STATS_PORT", "5000"), 10);

// Implementation

exports.PROJECTION_SRID = 32719;

exports.IMPLEMENTATION_BASE = env(
  "IMPLEMENTATION_BASE",
  path.join(exports.BASE_DIR, "impl")
);

exports.PROFILES_FORMAT = env("PROFILES_FORMAT", "yml");

exports.ENGINE_EXECUTION_MODE = env(
  "ENGINE_EXECUTION_MODE",
  exports.NODE_ENV === "test" ? "eval" : "import"
);

exports.ENGINE_EXECUTION_TIMEOUT = parseInt(
  env("ENGINE_EXECUTION_TIMEOUT", "300000"),
  10
);

exports.ENRICHMENT_FORWARD_COMMAND = env(
  "ENRICHMENT_FORWARD_COMMAND",
  "enrichment.results"
);

exports.HASHING_ALGORITHM = env("HASHING_ALGORITHM", "sha256");
