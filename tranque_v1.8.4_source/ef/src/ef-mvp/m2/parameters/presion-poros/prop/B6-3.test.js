const utilsAssertMock = (x) => x;
const seriesQueryMock = jest.fn();
const seriesYieldMock = jest.fn();

const invoke = () => script({
  ctx: {rootRef: {data_source: {id: "this-source"}}},
  utils: {assert: utilsAssertMock},
  series: {
    query: seriesQueryMock,
    yield: seriesYieldMock
  }
});

test("raises if at least two redundant events are raised, and both of them are valid", async () => {
  // setup
  seriesQueryMock.mockReturnValueOnce(Promise.resolve({meta: {
    vars: [
      {data_source: {id: "this-source"}, canonical_name: "this-variable"},
      {data_source: {id: "that-source"}, canonical_name: "that-variable"},
      {data_source: {id: "other-source"}, canonical_name: "other-variable"}
    ],
    heads: [
      {name: "this-variable", value: 1, meta: {valid: true}},
      {name: "that-variable", value: 1, meta: {valid: true}},
      {name: "other-variable", value: 0, meta: {valid: true}},
    ]
  }}));
  // invoke
  await invoke();
  // assert
  expect(seriesYieldMock).toHaveBeenCalledWith(true, {meta: {others: ["that-variable"]}});
});

test("doesn't raise events if no other events are valid", async () => {
  // setup
  seriesQueryMock.mockReturnValueOnce(Promise.resolve({meta: {
    vars: [
      {data_source: {id: "this-source"}, canonical_name: "this-variable"},
      {data_source: {id: "that-source"}, canonical_name: "that-variable"},
      {data_source: {id: "other-source"}, canonical_name: "other-variable"}
    ],
    heads: [
      {name: "this-variable", value: 1, meta: {valid: true}},
      {name: "that-variable", value: 1, meta: {valid: false}},
      {name: "other-variable", value: 0, meta: {valid: true}},
    ]
  }}));
  // invoke
  await invoke();
  // assert
  expect(seriesYieldMock).toHaveBeenCalledWith(false, {meta: {others: ["that-variable"]}});
});
