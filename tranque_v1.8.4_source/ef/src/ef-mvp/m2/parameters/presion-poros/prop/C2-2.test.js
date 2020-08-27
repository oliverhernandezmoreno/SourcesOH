const utilsIsDefinedMock = (x) => typeof x !== "undefined" && x !== null;
const utilsAssertMock = (x) => {
  if (!utilsIsDefinedMock(x)) {
    throw new Error("assert!");
  }
  return x;
};
const seriesQueryMock = jest.fn();
const seriesYieldMock = jest.fn();

const invoke = () => script({
  ctx: {rootRef: {data_source: {id: "this-source"}}},
  utils: {
    isDefined: utilsIsDefinedMock,
    assert: utilsAssertMock
  },
  series: {
    query: seriesQueryMock,
    yield: seriesYieldMock
  }
});

test("raises on the prescribed conditions", async () => {
  // setup
  seriesQueryMock
    .mockReturnValueOnce(Promise.resolve({meta: {
      vars: [
        {data_source: {id: "this-source"}, canonical_name: "this-variable"},
        {data_source: {id: "that-source"}, canonical_name: "that-variable"},
        {data_source: {id: "other-source"}, canonical_name: "other-variable"}
      ],
      heads: [
        {name: "this-variable", value: 1, meta: {valid: true}},
        {name: "that-variable", value: 0},
        {name: "other-variable", value: 0},
      ]
    }}))
    .mockReturnValueOnce(Promise.resolve({meta: {
      vars: [
        {data_source: {id: "this-source"}, canonical_name: "this-variable"},
        {data_source: {id: "that-source"}, canonical_name: "that-variable"},
        {data_source: {id: "other-source"}, canonical_name: "other-variable"}
      ],
      heads: [
        {name: "this-variable", value: 1},
        {name: "that-variable", value: 1},
        {name: "other-variable", value: 0},
      ]
    }}));
  // invoke
  await invoke();
  // assert
  expect(seriesYieldMock).toHaveBeenCalledWith(true, {meta: {others: ["that-variable"]}});
});

test("doesn't raise an event if no redundant events are detected", async () => {
  // setup
  seriesQueryMock
    .mockReturnValueOnce(Promise.resolve({meta: {
      vars: [
        {data_source: {id: "this-source"}, canonical_name: "this-variable"},
        {data_source: {id: "that-source"}, canonical_name: "that-variable"},
        {data_source: {id: "other-source"}, canonical_name: "other-variable"}
      ],
      heads: [
        {name: "this-variable", value: 1, meta: {valid: true}},
        {name: "that-variable", value: 0},
        {name: "other-variable", value: 0},
      ]
    }}))
    .mockReturnValueOnce(Promise.resolve({meta: {
      vars: [
        {data_source: {id: "this-source"}, canonical_name: "this-variable"},
        {data_source: {id: "that-source"}, canonical_name: "that-variable"},
        {data_source: {id: "other-source"}, canonical_name: "other-variable"}
      ],
      heads: [
        {name: "this-variable", value: 1},
        {name: "that-variable", value: 0},
        {name: "other-variable", value: 0},
      ]
    }}));
  // invoke
  await invoke();
  // assert
  expect(seriesYieldMock).toHaveBeenCalledWith(false, {meta: {others: []}});
});
