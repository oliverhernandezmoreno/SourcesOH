import * as fs from "fs";
import * as glob from "glob";
import * as yaml from "js-yaml";
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

export const SENTRY_DSN = env("SENTRY_DSN");

export const OUTPUT_MODE = ({
  redis: "redis",
  elasticsearch: "elasticsearch",
  console: "console",
  stdout: "stdout",
  beatsconsumer: "beatsConsumer",
})[env("OUTPUT_MODE", "")] || "redis";

// Redis

export const REDIS_HOST = env("REDIS_HOST", "localhost");

export const REDIS_PORT = parseInt(env("REDIS_PORT", "6379"), 10);

export const REDIS_KEY = env("REDIS_KEY", "beats.buffer");

// Elasticsearch

export const ELASTICSEARCH_PROTOCOL = env("ELASTICSEARCH_PROTOCOL", "http");

export const ELASTICSEARCH_HOST = env("ELASTICSEARCH_HOST", "localhost");

export const ELASTICSEARCH_PORT = env("ELASTICSEARCH_PORT", "9200");

// Beats Consumer

export const CONSUMER_ENDPOINT = env("CONSUMER_ENDPOINT", "localhost");

export const CONSUMER_TOKEN = env("CONSUMER_TOKEN", "token");

// Control

export const CONTROL_PORT = 5000;

// Event generation

export const NAMESPACE = env("NAMESPACE", "unspecified-namespace");

class Box {

  private read;
  private cached = false;
  private cachedValue = null;

  constructor(read) {
    this.read = read;
  }

  public value() {
    if (!this.cached) {
      this.cachedValue = this.read();
      this.cached = true;
    }
    return this.cachedValue;
  }

  public expire() {
    this.cached = false;
    this.cachedValue = null;
  }

  public toString() {
    return JSON.stringify(this.value(), null, 2);
  }
}

const cross = (args) => {
  if (args.length === 0) {
    return [];
  }
  const [expansions, ...others] = args;
  if (others.length === 0) {
    return expansions;
  }
  return cross([
    expansions
      .flatMap((exp) => others[0].map((newExp) => ({...exp, ...newExp}))),
    ...others.slice(1),
  ]);
};

const replaceInTemplate = (template, replacements) => {
  if (typeof template === "string") {
    return Object.entries(replacements).reduce(
      (partial, [name, value]) => partial.replace(new RegExp(`{${name}}`, "g"), String(value)),
      template,
    );
  }
  if (typeof template === "object" && Array.isArray(template)) {
    return (template as any[]).map((inner) => replaceInTemplate(inner, replacements));
  }
  if (typeof template === "object") {
    return Object.entries(template)
      .map(([innerK, innerV]) => [innerK, replaceInTemplate(innerV, replacements)])
      .reduce((acc, [innerK, innerV]) => ({...acc, [innerK]: innerV}), {});
  }
  return template;
};

const expandTemplate = (obj) => typeof obj.template === "undefined" ?
  [obj] :
  cross(
    Object.entries(obj.variables || {})
      .map(([name, values]) => (values as any[]).map((v) => ({[name]: v}))),
  ).map((replacements) => replaceInTemplate(obj.template, replacements));

const defaultBehaviour = {
  timeseries: "default",
  interval: {
    distribution: {
      name: "constant",
      value: 1000,
    },
  },
  value: {
    distribution: {
      name: "normal",
      mean: 0.5,
      std: 0.25,
    },
    fitMin: 0,
    fitMax: 1,
    staticCurve: [0, 10, 0, -10, 0],
  },
  metadata: [{
    key: "TODO",
    value: "SET A CUSTOM FAKE BEHAVIOUR",
  }],
  meta: {lorem: "seriously"},
};

export const FAKING_BEHAVIOUR = new Box(() => {
  const fromenv = env("FAKING_BEHAVIOUR", JSON.stringify([defaultBehaviour]));
  let parsed;
  try {
    parsed = JSON.parse(fromenv);
  } catch (_) {
    parsed = fromenv
      .split(",")
      .map((f) => f.trim())
      .filter((f) => f.length > 0)
      .flatMap((f) => glob.sync(f))
      .map((f) => ({f, content: fs.readFileSync(f).toString()}))
      .flatMap(
        ({f, content}) => f.endsWith(".json") ?
          JSON.parse(content) :
          yaml.safeLoadAll(content),
      );
  }
  const expanded = parsed.flatMap(expandTemplate);
  if (expanded.length === 0) {
    throw new Error("The variable FAKING_BEHAVIOUR doesn't resolve to any behaviour");
  }
  return expanded;
});
