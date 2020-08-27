import * as fs from "fs";
import * as path from "path";
import * as winston from "winston";

const env = (key: string, absent: string = null) => {
  return Object.keys(process.env).indexOf(key) === -1 ?
    absent :
    process.env[key];
};

// General

export const NODE_ENV = env("NODE_ENV");

export const BASE_DIR = path.dirname(__dirname);

export const LOG_LEVEL = (
  (level) => typeof winston.config.npm.levels[level] === "undefined" ? "info" : level
)(env("LOG_LEVEL", "info"));

let branch = null;
let commit = null;
try {
  const head = fs.readFileSync(path.join(BASE_DIR, ".git", "HEAD"))
    .toString()
    .trim();
  if (!head.startsWith("ref: ")) {
    commit = head;
  } else {
    branch = head.split("/").reverse()[0];
    commit = fs.readFileSync(path.join(BASE_DIR, ".git", head.split(" ")[1]))
      .toString()
      .trim();
  }
} catch (_) {
  // pass
}
export const BRANCH = branch;
export const COMMIT = commit;

export const SENTRY_DSN = env("BEATS_CONSUMER_SENTRY_DSN");

export const OUTPUT_MODE = ({
  redis: "redis",
  console: "console",
})[env("OUTPUT_MODE", "")] || "redis";

export const CONSUMER_PORT = 5000;

export const ACCESS_PASSWORDS = env("ACCESS_PASSWORDS", "")
  .split(",")
  .map((p) => p.trim())
  .filter((p) => p.length > 0);

// Redis

export const REDIS_HOST = env("REDIS_HOST", "localhost");

export const REDIS_PORT = parseInt(env("REDIS_PORT", "6379"), 10);

export const REDIS_KEY = env("REDIS_KEY", "beats.buffer");
