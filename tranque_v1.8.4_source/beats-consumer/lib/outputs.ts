import * as redisLib from "redis";

import * as conf from "./conf";
import * as log from "./log";
import * as schema from "./schema";

export type IOutput = (events: schema.IEvent[]) => void;

export const console: IOutput = (events) => events.forEach((e) => log.trace(e));

export const client = (() => {
  let innerClient = null;
  return () => {
    if (!innerClient) {
      innerClient = redisLib.createClient(conf.REDIS_PORT, conf.REDIS_HOST);
    }
    return innerClient;
  };
})();

export const redis: IOutput = (events) => client().rpush(
  conf.REDIS_KEY,
  ...events.map((event) => JSON.stringify(event)),
  (err) => {
    if (err) {
      log.error(err.toString());
    }
  },
);
