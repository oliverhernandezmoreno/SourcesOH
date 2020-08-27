const utilsAssertMock = (x) => {
  if (typeof x === "undefined" || x === null) {
    throw new Error("assert!");
  }
  return x;
};
const seriesYieldMock = jest.fn();

const invoke = (threshold, value) => script({
  ctx: {rootRef: {data_source: {
    id: "this-source"
  }}},
  utils: {assert: utilsAssertMock},
  series: {
    query: () => Promise.resolve({meta: {
      vars: [{
        data_source: {id: "this-source"},
        canonical_name: "this-variable.presion-poros",
        active_thresholds: [
          {upper: null, kind: "dren"},
          {upper: `${threshold}`, kind: "dren"},
          {upper: `${threshold - 1}`}
        ]
      }, {
        data_source: {id: "this-source"},
        canonical_name: "this-variable.presion-poros.validado"
      }, {
        data_source: {id: "other-source"},
        canonical_name: "irrelevant"
      }],
      heads: [
        {name: "irrelevant", value: threshold + 1},
        {name: "this-variable.presion-poros", value},
        {name: "this-variable.presion-poros.validado", value: 0}
      ],
    }}),
    yield: seriesYieldMock
  }
});

test("raises an event on the expected condition", async () => {
  // invoke
  await invoke(1.5, 1.6);
  // assert
  expect(seriesYieldMock).toHaveBeenCalledWith(true, {meta: {threshold: 1.5, value: 1.6, valid: false}});
});

test("doesn't raise event on value equals threshold", async () => {
  // invoke
  await invoke(1.5, 1.5);
  // assert
  expect(seriesYieldMock).toHaveBeenCalledWith(false, {meta: {threshold: 1.5, value: 1.5, valid: false}});
});
