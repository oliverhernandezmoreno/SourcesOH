import * as bh from "./behaviour";
import * as conf from "./conf";
import * as random from "./random";

export interface IEvent {
  "@timestamp": string;
  "value": number;
  "name": string;
  "labels": bh.IMetadata[];
  "coords"?: {
    "x"?: number;
    "y"?: number;
    "z"?: number;
  };
  "meta"?: object;
}

const makeEvent = (behaviour: bh.IFakingBehaviour, timestamp: Date): IEvent => ({
  "@timestamp": (new Date(
    timestamp.getTime() +
      (behaviour.timestampOffset ? random.gen(behaviour.timestampOffset) : 0),
  )).toJSON(),
  "value": random.gen(behaviour.value),
  "name": behaviour.timeseries,
  "coords": {
    ...(typeof behaviour.xCoord !== "undefined" ? {x: random.gen(behaviour.xCoord)} : {}),
    ...(typeof behaviour.yCoord !== "undefined" ? {y: random.gen(behaviour.yCoord)} : {}),
    ...(typeof behaviour.zCoord !== "undefined" ? {z: random.gen(behaviour.zCoord)} : {}),
  },
  "labels": [...bh.omnipresentMetadata, ...(behaviour.metadata || [])],
  ...(typeof behaviour.meta !== "undefined" ? {meta: behaviour.meta} : {}),
});

const randomNatural = (r: bh.IRandomValue) => {
  const value = Math.round(random.gen(r));
  return value <= 0 ? 1 : value;
};

function* makeIntervalSequence(behaviour: bh.IFakingBehaviour) {
  while (true) {
    yield randomNatural(behaviour.interval);
    const burst = behaviour.burst ?
      (typeof behaviour.burst.p === "undefined" ? true : Math.random() <= behaviour.burst.p) :
      false;
    const burstEvents = burst ?
      randomNatural(behaviour.burst.quantity) :
      0;
    for (let i = 0; i < burstEvents; i++) {
      yield randomNatural(behaviour.burst.interval);
    }
  }
}

export const makeBeater = (behaviour: bh.IFakingBehaviour, output: (event: IEvent) => void) => {
  const intervalSequence = makeIntervalSequence(behaviour);
  let timeout = null;
  let stopped = true;
  const schedule = () => setTimeout(() => {
    if (!stopped) {
      output(makeEvent(behaviour, new Date()));
      timeout = schedule();
    }
  }, intervalSequence.next().value as number);

  return {
    behaviour,
    start() {
      stopped = false;
      if (!timeout) {
        timeout = schedule();
      }
      return this;
    },
    stop() {
      stopped = true;
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      return this;
    },
  };
};

const orValue = (thing, value) => typeof thing === "undefined" ? value : thing;

export const staticRun = async (
  behaviour: bh.IFakingBehaviour,
  fromDate: Date,
  toDate: Date,
) => {
  const output = async (e) => {
    const drained = process.stdout.write(`${JSON.stringify(e)}\n`, "utf-8");
    if (!drained) {
      await new Promise((resolve) => process.stdout.on("drain", resolve));
    }
  };
  const start = fromDate.getTime();
  const end = toDate.getTime();
  const interpolate = (w) => {
    const curve = behaviour.value.staticCurve;
    if (typeof curve === "undefined" || curve.length === 0) {
      return 0;
    }
    if (curve.length === 1) {
      return curve[0];
    }
    if (w <= 0) {
      return curve[0];
    }
    if (w >= 1) {
      return curve[curve.length - 1];
    }
    const wIndex = Math.ceil(w * (curve.length - 1)) - 1;
    const pair = curve.slice(1).map((p2, index) => [curve[index], p2])[wIndex];
    const wPair = w * (curve.length - 1) - wIndex;
    return pair[0] + wPair * (pair[1] - pair[0]);
  };

  const boundRun = async (baseDate, bounds, prop) => {
    for (let i = bounds[0]; i <= bounds[1]; i += bounds[2]) {
      const baseValue = interpolate((i - bounds[0]) / (bounds[1] - bounds[0]));
      const baseEvent = makeEvent(behaviour, baseDate);
      await output({
        ...baseEvent,
        value: baseEvent.value + baseValue,
        coords: {
          ...orValue(baseEvent.coords, {}),
          [prop]: i + orValue(orValue(baseEvent.coords, {[prop]: 0})[prop], 0),
        },
      });
    }
  };

  let iter = start;
  const intervalSequence = makeIntervalSequence(behaviour);
  while (iter <= end) {
    const baseDate = new Date(iter);
    let bounded = false;
    if (typeof behaviour.xCoord !== "undefined" &&
        typeof behaviour.xCoord.staticBounds !== "undefined") {
      await boundRun(baseDate, behaviour.xCoord.staticBounds, "x");
      bounded = true;
    }
    if (typeof behaviour.yCoord !== "undefined" &&
        typeof behaviour.yCoord.staticBounds !== "undefined") {
      await boundRun(baseDate, behaviour.yCoord.staticBounds, "y");
      bounded = true;
    }
    if (typeof behaviour.zCoord !== "undefined" &&
        typeof behaviour.zCoord.staticBounds !== "undefined") {
      await boundRun(baseDate, behaviour.zCoord.staticBounds, "z");
      bounded = true;
    }
    if (!bounded) {
      const baseValue = interpolate(end === start ? 0 : ((iter - start) / (end - start)));
      const baseEvent = makeEvent(behaviour, baseDate);
      await output({
        ...baseEvent,
        value: baseEvent.value + baseValue,
      });
    }
    iter += (intervalSequence.next().value as number);
  }
};
