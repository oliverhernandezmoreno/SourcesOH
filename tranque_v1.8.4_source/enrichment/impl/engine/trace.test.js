/* global expect, test */
const {packagedDependencies} = require("../../lib/handler");
const {handler} = require("./index");
const {indexMany, genName, makeEvent} = require("../../lib/test-utils");
const {mockedBackend} = require("./backend.mock");

// Utility to prepare contexts for these tests
const makeTestGraph = (...scripts) => {
  const rawName = genName();
  const derivedNames = scripts.map(genName);
  const event = makeEvent(rawName);
  return async () => {
    const events = await indexMany([event(1)]);
    const output = await handler(
      {events},
      {
        ...packagedDependencies,
        backend: mockedBackend({
          timeseries: {
            [rawName]: {canonical_name: rawName},
            ...scripts
              .map((script, index) => [
                derivedNames[index],
                {
                  canonical_name: derivedNames[index],
                  inputs: [index === 0 ? rawName : derivedNames[index - 1]],
                  script,
                },
              ])
              .reduce((acc, [k, v]) => ({...acc, [k]: v}), {}),
          },
          plans: {[rawName]: [rawName, ...derivedNames]},
        }),
      }
    );
    return {events, output};
  };
};

test("dependency trace is empty for computations without queries", async () => {
  const {output} = await makeTestGraph(`series.yield(0)`)();
  expect(output.length).toEqual(1);
  expect(output[0].dependencies).toEqual([]);
});

test("dependency trace includes queried values", async () => {
  const {events, output} = await makeTestGraph(
    `series.yield(await series.query({head: "*"}).then(({value}) => value));`
  )();
  expect(output.length).toEqual(1);
  expect(output[0].dependencies).toEqual(events.map(({_id}) => _id));
});

test("dependency trace includes values from previous dependency traces", async () => {
  const {events, output} = await makeTestGraph(
    `series.yield(await series.query({head: "*"}).then(({value}) => value));`,
    `series.yield(await series.query({head: "*"}).then(({value}) => value));`
  )();
  expect(output.length).toEqual(2);
  expect(output[0].dependencies).toEqual(events.map(({_id}) => _id));
  expect(output[1].dependencies.sort()).toEqual(
    [output[0]._id, ...output[0].dependencies].sort()
  );
});

test("dependency trace excludes full traces from values of the same series", async () => {
  const graph = makeTestGraph(`
const input = await series.query({head: "*"});
const previous = await series.query({head: ctx.rootRef});
series.yield(input.value + (previous || {value: 0}).value);
`);
  const {events: events1, output: output1} = await graph();
  expect(output1.length).toEqual(1);
  expect(output1[0].value).toEqual(1); // 1 + 0
  expect(output1[0].dependencies).toEqual(events1.map(({_id}) => _id));
  const {events: events2, output: output2} = await graph();
  expect(output2.length).toEqual(1);
  expect(output2[0].value).toEqual(2); // 1 + (1 + 0)
  expect(output2[0].dependencies.sort()).toEqual(
    [
      ...events2.map(({_id}) => _id),
      ...output1.map(({_id}) => _id),
      // and NOT INCLUDING events1.map(({_id}) => _id)
    ].sort()
  );
});

test("dependency trace includes references from multiple inputs", async () => {
  const rawNames = [genName(), genName()];
  const derivedName = genName();
  const events = await indexMany([makeEvent(rawNames[0])(1), makeEvent(rawNames[1])(1)]);
  const output = await handler(
    {events},
    {
      ...packagedDependencies,
      backend: mockedBackend({
        timeseries: {
          [rawNames[0]]: {canonical_name: rawNames[0]},
          [rawNames[1]]: {canonical_name: rawNames[1]},
          [derivedName]: {
            canonical_name: derivedName,
            inputs: rawNames,
            script: `
const heads = await series.queryAll({head: "*"});
series.yield(heads.reduce((s, e) => s + e.value, 0));
`,
          },
        },
        plans: {
          [rawNames[0]]: [rawNames[0], derivedName],
          [rawNames[1]]: [rawNames[1], derivedName],
        },
      }),
    }
  );
  expect(output.length).toEqual(1);
  expect(output[0].value).toEqual(2);
  expect(output[0].dependencies.sort()).toEqual(events.map(({_id}) => _id).sort());
});

test("dependency trace excludes references from not-related nodes but in the same execution plan", async () => {
  const rawName = genName();
  const derivedNames = [genName(), genName()];
  const events = await indexMany([makeEvent(rawName)(1)]);
  const output = await handler(
    {events},
    {
      ...packagedDependencies,
      backend: mockedBackend({
        timeseries: {
          [rawName]: {canonical_name: rawName},
          [derivedNames[0]]: {
            canonical_name: derivedNames[0],
            inputs: [rawName],
            script: `series.yield(await series.query({head: "*"}).then((e) => e.value));`,
          },
          [derivedNames[1]]: {
            canonical_name: derivedNames[1],
            inputs: [rawName],
            script: `series.yield(await series.query({head: "*"}).then((e) => e.value));`,
          },
        },
        plans: {
          [rawName]: [rawName, derivedNames[0], derivedNames[1]],
        },
      }),
    }
  );
  expect(output.length).toEqual(2);
  expect(output.map((e) => e.value)).toEqual([1, 1]);
  expect(output[0].dependencies.sort()).toEqual(events.map(({_id}) => _id).sort());
  expect(output[1].dependencies.sort()).toEqual(events.map(({_id}) => _id).sort());
});
