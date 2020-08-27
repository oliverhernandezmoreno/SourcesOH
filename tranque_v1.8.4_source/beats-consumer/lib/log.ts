import * as Raven from "raven";
import * as winston from "winston";

import * as conf from "./conf";

export const logger = winston.createLogger({
  level: conf.LOG_LEVEL,
  format: winston.format.json(),
  transports: [new winston.transports.Console()],
});

const SENTRY_LEVELS = {
  silly: "debug",
  debug: "debug",
  verbose: "debug",
  http: "info",
  info: "info",
  warn: "warning",
  error: "error",
};

const logMethod = (method) => (message, ...extra) => {
  Raven.captureBreadcrumb({
    message,
    data: extra
      .filter((piece) => typeof piece === "object")
      .map((piece) => Object.entries(piece).reduce((acc, [k, v]) => ({...acc, [k]: v}), {}))
      .reduce((acc, partial) => ({...acc, ...partial}), {}),
    category: method,
    level: SENTRY_LEVELS[method],
  });
  return logger[method](message, ...extra);
};

export const silly = logMethod("silly");
export const debug = logMethod("debug");
export const verbose = logMethod("verbose");
export const http = logMethod("http");
export const info = logMethod("info");
export const warn = logMethod("warn");
export const error = logMethod("error");
export const exception = (err: Error) => {
  const $ = error(err.toString(), err);
  Raven.captureException(err);
  return $;
};

Raven.config(conf.SENTRY_DSN, {
  release: conf.COMMIT,
}).install();

// tslint:disable-next-line
export const trace = console.log.bind(console);
