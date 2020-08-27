import * as elasticsearchLib from "@elastic/elasticsearch";
import axios from "axios";
import * as redisLib from "redis";

import * as conf from "./conf";
import * as generator from "./generator";
import * as log from "./log";

export const console = (event: generator.IEvent) => log.trace(event);

export const stdout = (event: generator.IEvent) => process.stdout.write(`${JSON.stringify(event)}\n`, "utf-8");

const redisClient = (() => {
  let innerClient = null;
  return () => {
    if (!innerClient) {
      innerClient = redisLib.createClient(conf.REDIS_PORT, conf.REDIS_HOST);
    }
    return innerClient;
  };
})();

export const redis = (event: generator.IEvent) => redisClient().rpush(
  conf.REDIS_KEY,
  JSON.stringify(event),
  (err) => {
    if (err) {
      log.error(err.toString());
    }
  });

const elasticsearchClient = new elasticsearchLib.Client({
  node: `${conf.ELASTICSEARCH_PROTOCOL}://${conf.ELASTICSEARCH_HOST}:${conf.ELASTICSEARCH_PORT}`,
});

export const elasticsearch = (event: generator.IEvent) => elasticsearchClient.index({
  index: (() => {
    const [year, month] = event["@timestamp"].slice(0, 7).split("-");
    return `raw-${year}.${month}`;
  })(),
  body: event,
});

export const beatsConsumer = (event: generator.IEvent) => {
  axios.post(
    conf.CONSUMER_ENDPOINT,
    [event],
    {headers: {Authorization: `Token ${conf.CONSUMER_TOKEN}`}},
  ).then((res) => {
    log.info(res.data);
  });
};
