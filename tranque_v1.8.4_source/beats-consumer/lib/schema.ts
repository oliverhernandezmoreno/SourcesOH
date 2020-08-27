import * as Ajv from "ajv";
import * as fs from "fs";
import * as path from "path";

import * as conf from "./conf";

export interface IMetadata {
  key: string;
  value: string;
}

export interface ICoords {
  x?: number;
  y?: number;
  z?: number;
}

export interface IEvent {
  "@timestamp": string;
  "value": number;
  "name": string;
  "coords": ICoords;
  "labels": IMetadata[];
  "meta": object;
}

const ajv = new Ajv();

export const schema = JSON.parse(fs.readFileSync(
  path.join(conf.BASE_DIR, "event.schema.json"),
  "utf-8",
));

const validateEventAgainstSchema = ajv.compile(schema);

export const validateEvent: (event: any, errFn: (message: string) => Error) => IEvent = (event, errFn) => {
  const valid = validateEventAgainstSchema(event);
  if (!valid) {
    throw errFn(ajv.errorsText(validateEventAgainstSchema.errors));
  }
  const timestamp = new Date(event["@timestamp"]);
  if (isNaN(timestamp.getTime())) {
    throw errFn("data.@timestamp is not a valid date");
  }
  return {
    ...event,
    "@timestamp": timestamp.toJSON(),
    "labels": event.labels || [],
  } as IEvent;
};

export const validateEvents: (events: any, errFn: (message: string) => Error) => IEvent[] = (events, errFn) => {
  if (!Array.isArray(events)) {
    throw errFn("events isn't an array");
  }
  return events.map((event) => validateEvent(event, errFn));
};
