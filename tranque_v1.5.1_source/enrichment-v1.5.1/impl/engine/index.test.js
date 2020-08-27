/* global expect, test */
const moment = require("moment");
const request = require("request");
const {packagedDependencies} = require("../../lib/handler");
const {handler} = require("./index");
const {indexMany, search, genName, makeEvent} = require("../../lib/test-utils");
const {mockedBackend} = require("./backend.mock");

test("handler fails if an empty message is given", async () => {
  expect.assertions(1);
  try {
    await handler(
      {events: []},
      {
        ...packagedDependencies,
        backend: mockedBackend(),
      }
    );
  } catch (e) {
    expect(e).toHaveProperty("message", "message is empty");
  }
});

test("retro-compatibility for the old series.save API", async () => {
  const rawName = genName();
  const derivedName = genName();
  const events = [makeEvent(rawName)(1)];

  const output = await handler(
    {events},
    {
      ...packagedDependencies,
      backend: mockedBackend({
        timeseries: {
          [rawName]: {
            canonical_name: rawName,
          },
          [derivedName]: {
            canonical_name: derivedName,
            inputs: [rawName],
            script: `
series.save(
  series.current("*")[0].value,
  series.current("*")[0]["@timestamp"],
  {x: 1, y: 2, z: 3},
  "some label",
  {metaProp: "some value"},
)
`,
          },
        },
        plans: {
          [rawName]: [rawName, derivedName],
        },
      }),
    }
  );
  expect(output).toHaveLength(1);
  const result = output[0];
  expect(result.value).toEqual(events[0].value);
  expect(result["@timestamp"]).toEqual(events[0]["@timestamp"]);
  expect(result.coords).toEqual({x: 1, y: 2, z: 3});
  expect(result.labels.find(({key}) => key === "enrichment-tag")).toEqual({
    key: "enrichment-tag",
    value: "some label",
  });
  expect(result.meta).toEqual({metaProp: "some value"});
});

test("a simple mapping", async () => {
  const rawName = genName();
  const derivedName = genName();
  const event = makeEvent(rawName);
  const events = [event(3), event(5), event(7)];

  expect.assertions(1);

  const output = await handler(
    {events},
    {
      ...packagedDependencies,
      backend: mockedBackend({
        timeseries: {
          [rawName]: {
            canonical_name: rawName,
          },
          [derivedName]: {
            canonical_name: derivedName,
            inputs: [rawName],
            script: `
series.current("*").forEach(
  (event) => series.yield(event.value * event.value, {timestamp: ctx.timeframe.end}),
);
`,
          },
        },
        plans: {
          [rawName]: [rawName, derivedName],
        },
      }),
    }
  );
  expect(output.map(({value}) => value).sort((a, b) => a - b)).toEqual([9, 25, 49]);
});

test("a simple mapping, fetched from the index", async () => {
  const baseDate = moment();
  const rawName = genName();
  const derivedName = genName();
  const events = [
    makeEvent(rawName, baseDate.toJSON())(3),
    makeEvent(rawName, baseDate.clone().subtract(1, "second").toJSON())(5),
    makeEvent(rawName, baseDate.clone().subtract(2, "second").toJSON())(7),
  ];
  await indexMany(events);

  expect.assertions(2);

  const output = await handler(
    {events},
    {
      ...packagedDependencies,
      backend: mockedBackend({
        timeseries: {
          [rawName]: {
            canonical_name: rawName,
          },
          [derivedName]: {
            canonical_name: derivedName,
            inputs: [rawName],
            script: `
const events = await series.query({slice: "*", count: 4});
events.forEach(
  (event) => series.yield(event.value * event.value, {timestamp: event["@timestamp"]}),
);
`,
          },
        },
        plans: {
          [rawName]: [rawName, derivedName],
        },
      }),
    }
  );
  expect(output.map((event) => event.value).sort((a, b) => a - b)).toEqual([9, 25, 49]);

  const storedEvents = await search(derivedName);
  expect(storedEvents.map((event) => event.value).sort((a, b) => a - b)).toEqual([
    9,
    25,
    49,
  ]);
});

test("simple arithmetic", async () => {
  const rawNameA = genName();
  const rawNameB = genName();
  const derivedNameA = genName();
  const derivedNameB = genName();
  const derivedNameC = genName();
  const baseDate = moment();
  const events = [
    makeEvent(rawNameA, baseDate.toJSON())(3),
    makeEvent(rawNameA, baseDate.add(1, "second").toJSON())(5),
    makeEvent(rawNameA, baseDate.add(1, "second").toJSON())(7),
    makeEvent(rawNameB, baseDate.add(1, "second").toJSON())(4),
    makeEvent(rawNameB, baseDate.add(1, "second").toJSON())(8),
    makeEvent(rawNameB, baseDate.add(1, "second").toJSON())(16),
  ];
  await indexMany(events);

  expect.assertions(3);

  await handler(
    {events},
    {
      ...packagedDependencies,
      backend: mockedBackend({
        timeseries: {
          [rawNameA]: {canonical_name: rawNameA},
          [rawNameB]: {canonical_name: rawNameB},
          [derivedNameA]: {
            canonical_name: derivedNameA,
            inputs: [rawNameA, rawNameB],
            script: `
const rs = refs.expand("*");
const [h1, h2] = rs.map((r) => series.current(r)[0]);
// 7 + 16
series.yield(h1.value + h2.value, {timestamp: ctx.timeframe.end});
`,
          },
          [derivedNameB]: {
            canonical_name: derivedNameB,
            inputs: [rawNameA, rawNameB],
            script: `
const [s1, s2] = await series.queryAll({slice: "*"});
// 3 * 4 + 5 * 8 + 7 * 16
series.yield(
  s1.map((event, index) => event.value * s2[index].value)
    .reduce((partial, v) => partial + v, 0),
  {timestamp: ctx.timeframe.end},
);
`,
          },
          [derivedNameC]: {
            canonical_name: derivedNameC,
            inputs: [rawNameA, rawNameB, derivedNameB],
            script: `
const rs = await refs.getMany("*");
const [h1, h2, h3] = await series.queryAll({head: rs});
// (3 * 4 + 5 * 8 + 7 * 16) - 16 - 7 * 7
series.yield(
  h3.value - h2.value - h1.value * h1.value,
  {timestamp: ctx.timeframe.end},
);
`,
          },
        },
        plans: {
          [rawNameA]: [rawNameA, derivedNameA, derivedNameB, derivedNameC],
          [rawNameB]: [rawNameB, derivedNameA, derivedNameB, derivedNameC],
        },
      }),
    }
  );

  const [storedEventA] = await search(derivedNameA);
  expect(storedEventA.value).toEqual(7 + 16);

  const [storedEventB] = await search(derivedNameB);
  expect(storedEventB.value).toEqual(3 * 4 + 5 * 8 + 7 * 16);

  const [storedEventC] = await search(derivedNameC);
  expect(storedEventC.value).toEqual(3 * 4 + 5 * 8 + 7 * 16 - 16 - 7 * 7);
});

test("time filters", async () => {
  const rawName = genName();
  const baseDate = moment();
  const events = [
    makeEvent(rawName, baseDate.toJSON())(0),
    makeEvent(rawName, baseDate.clone().subtract(1, "second").toJSON())(1),
    makeEvent(rawName, baseDate.clone().subtract(2, "second").toJSON())(2),
    makeEvent(rawName, baseDate.clone().subtract(3, "second").toJSON())(3),
    makeEvent(rawName, baseDate.clone().subtract(4, "second").toJSON())(4),
    makeEvent(rawName, baseDate.clone().subtract(5, "second").toJSON())(5),
    makeEvent(rawName, baseDate.clone().subtract(6, "second").toJSON())(6),
    makeEvent(rawName, baseDate.clone().subtract(7, "second").toJSON())(7),
    makeEvent(rawName, baseDate.clone().subtract(8, "second").toJSON())(8),
  ];
  await indexMany(events);

  expect.assertions(1);

  const output = await handler(
    {events},
    {
      ...packagedDependencies,
      backend: mockedBackend({
        timeseries: {
          [rawName]: {
            canonical_name: rawName,
            script: `
const [s1, s2, s3] = await series.query([
  {slice: ctx.rootRef, since: "${baseDate.clone().subtract(6, "second").toJSON()}"},
  {slice: ctx.rootRef, until: "${baseDate.clone().subtract(3, "second").toJSON()}"},
  {slice: ctx.rootRef,
   since: "${baseDate.clone().subtract(7, "second").toJSON()}",
   until: "${baseDate.clone().subtract(5, "second").toJSON()}"},
]);
[...s1, ...s2, ...s3].forEach(({value}) => series.yield(value));
`,
          },
        },
        plans: {
          [rawName]: [rawName],
        },
      }),
    }
  );

  expect(
    output.sort((e1, e2) => e1.sequence - e2.sequence).map((event) => event.value)
  ).toEqual([0, 1, 2, 3, 4, 5, 6, 3, 4, 5, 6, 7, 8, 5, 6, 7]);
});

test("multiple heads for the same timeseries", async () => {
  const rawName = genName();
  const baseDate = moment();
  const events = [
    {
      ...makeEvent(rawName, baseDate.toJSON())(5),
      sequence: 0,
    },
    {
      ...makeEvent(rawName, baseDate.toJSON())(4),
      sequence: 1,
    },
    {
      ...makeEvent(rawName, baseDate.toJSON())(3),
      sequence: 2,
    },
    {
      ...makeEvent(rawName, baseDate.toJSON())(2),
      sequence: 3,
    },
    // exclude this event from the 'head' by moving it backward one second
    {
      ...makeEvent(rawName, baseDate.clone().subtract(1, "second").toJSON())(1),
      sequence: 4,
    },
  ];
  await indexMany(events);

  expect.assertions(3);
  const output = await handler(
    {events},
    {
      ...packagedDependencies,
      backend: mockedBackend({
        timeseries: {
          [rawName]: {
            canonical_name: rawName,
            script: `
const [head, heads] = await series.query([
  {head: ctx.rootRef},
  {head: ctx.rootRef, all: true}
]);
series.yield(head.value);
series.yield(heads.reduce((partial, h) => partial + h.value, 0));
`,
          },
        },
        plans: {
          [rawName]: [rawName],
        },
      }),
    }
  );

  expect(output).toHaveLength(2);
  expect([5, 4, 3, 2]).toContain(output[0].value);
  expect(output[1].value).toEqual(5 + 4 + 3 + 2);
});

test("events with coordinates, tags, and metadata", async () => {
  const rawName = genName();
  const derivedName = genName();
  const baseDate = moment();
  const events = [
    {
      ...makeEvent(rawName, baseDate.toJSON())(0),
      coords: {
        x: 100,
        z: 900,
      },
    },
    {
      ...makeEvent(
        rawName,
        baseDate.clone().subtract(1, "second").toJSON(),
        "This is an important tag"
      )(1),
      coords: {
        y: 200,
        z: 850,
      },
    },
    {
      ...makeEvent(
        rawName,
        baseDate.clone().subtract(2, "second").toJSON(),
        "This is another tag",
        {
          and: "this is arbitrary metadata",
        }
      )(2),
      coords: {
        x: 90,
        y: 190,
        z: 840,
      },
    },
  ];
  await indexMany(events);

  expect.assertions(1);

  await handler(
    {events},
    {
      ...packagedDependencies,
      backend: mockedBackend({
        timeseries: {
          [rawName]: {
            canonical_name: rawName,
          },
          [derivedName]: {
            canonical_name: derivedName,
            inputs: [rawName],
            script: `
const vs = await series.current("*");
vs.forEach((v) => {
  const tag = v.labels.find(({key}) => key === "enrichment-tag");
  series.yield(
    v.value,
    {
      timestamp: v["@timestamp"],
      coords: v.coords,
      label: tag ? tag.value : null,
      meta: v.meta,
    },
  );
});
`,
          },
        },
        plans: {
          [rawName]: [rawName, derivedName],
        },
      }),
    }
  );

  const output = await search(derivedName);

  expect(
    output.map((event) => [
      event.value,
      event.coords.x,
      event.coords.y,
      event.coords.z,
      event.labels.find(({key}) => key === "enrichment-tag"),
      event.meta,
    ])
  ).toEqual([
    [0, 100, undefined, 900, undefined, null],
    [
      1,
      undefined,
      200,
      850,
      {key: "enrichment-tag", value: "This is an important tag"},
      null,
    ],
    [
      2,
      90,
      190,
      840,
      {key: "enrichment-tag", value: "This is another tag"},
      {and: "this is arbitrary metadata"},
    ],
  ]);
});

test("invocation of a stats function", async () => {
  const rawName = genName();
  const derivedName = genName();
  const baseDate = moment();
  const events = [makeEvent(rawName, baseDate.toJSON())(0)];
  await indexMany(events);

  expect.assertions(1);

  const mockedHost = `http://${packagedDependencies.conf.STATS_HOST}:${packagedDependencies.conf.STATS_PORT}`;
  const output = await request.withRule(
    `${mockedHost}/foobar`,
    {statusCode: 200},
    {result: 7}
  )(() =>
    handler(
      {events},
      {
        ...packagedDependencies,
        backend: mockedBackend({
          timeseries: {
            [rawName]: {
              canonical_name: rawName,
            },
            [derivedName]: {
              canonical_name: derivedName,
              inputs: [rawName],
              script: `
const {result} = await utils.stats("foobar", {thisWillBe: "ignored because of the mock"});
series.yield(result);
`,
            },
          },
          plans: {
            [rawName]: [rawName, derivedName],
          },
        }),
      }
    )
  );

  expect(output.map((event) => event.value)).toEqual([7]);
});

test("yielding of a boolean value", async () => {
  const rawName = genName();
  const derivedName = genName();
  const baseDate = moment();
  const events = [makeEvent(rawName, baseDate.toJSON())(0)];
  await indexMany(events);

  expect.assertions(1);

  const output = await handler(
    {events},
    {
      ...packagedDependencies,
      backend: mockedBackend({
        timeseries: {
          [rawName]: {
            canonical_name: rawName,
          },
          [derivedName]: {
            canonical_name: derivedName,
            inputs: [rawName],
            script: "series.yield(true); series.yield(false); series.yield(3.1415);",
          },
        },
        plans: {
          [rawName]: [rawName, derivedName],
        },
      }),
    }
  );

  expect(output.map((event) => event.value)).toEqual([1, 0, 3.1415]);
});

test("a failed step is skipped over", async () => {
  const rawName = genName();
  const derivedNameOne = genName();
  const derivedNameTwo = genName();
  const baseDate = moment();
  const events = [makeEvent(rawName, baseDate.toJSON())(3.1415)];
  await indexMany(events);

  expect.assertions(1);

  const output = await handler(
    {events},
    {
      ...packagedDependencies,
      backend: mockedBackend({
        timeseries: {
          [rawName]: {
            canonical_name: rawName,
          },
          [derivedNameOne]: {
            canonical_name: derivedNameOne,
            script: `
const _ = await series.query({head: "*"});
throw new Error("surprise!");
`,
          },
          [derivedNameTwo]: {
            canonical_name: derivedNameTwo,
            script: `
const e = await series.query({head: "${rawName}"});
series.yield(e.value);
`,
            inputs: [rawName, derivedNameOne],
          },
        },
        plans: {
          [rawName]: [rawName, derivedNameOne, derivedNameTwo],
        },
      }),
    }
  );

  expect(output.map((event) => event.value)).toEqual([3.1415]);
});
