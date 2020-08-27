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

test("raises an event on the expected conditions", async () => {
  // setup
  seriesQueryMock
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
    }}))
    .mockReturnValueOnce(Promise.resolve({
      value: 1
    }));
  // invoke
  await invoke();
  // assert
  expect(seriesYieldMock).toHaveBeenCalledWith(true, {meta: {others: ["that-variable"]}});
});

test("doesn't raise an event when no other event is raised", async () => {
  // setup
  seriesQueryMock
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
    }}))
    .mockReturnValueOnce(Promise.resolve({
      value: 1
    }));
  // invoke
  await invoke();
  // assert
  expect(seriesYieldMock).toHaveBeenCalledWith(false, {meta: {others: []}});
});

test("doesn't raise an event if the current source doesn't have a raised event", async () => {
  // setup
  seriesQueryMock
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
    }}))
    .mockReturnValueOnce(Promise.resolve({
      value: 0
    }));
  // invoke
  await invoke();
  // assert
  expect(seriesYieldMock).toHaveBeenCalledWith(false, {meta: {others: []}});
});
