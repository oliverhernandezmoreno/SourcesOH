const utilsAssertMock = (x) => {
  if (typeof x === "undefined" || x === null) {
    throw new Error("assert!");
  }
  return x;
};
const seriesQueryMock = jest.fn();
const seriesYieldMock = jest.fn();

const invoke = () => script({
  utils: {assert: utilsAssertMock},
  series: {
    query: seriesQueryMock,
    yield: seriesYieldMock
  }
});

test("raises event if two redundant B3 events are detected", async () => {
  // setup
  seriesQueryMock.mockReturnValueOnce(Promise.resolve({meta: {heads: [
    {name: "foo", value: 1},
    {name: "bar", value: 1},
    {name: "baz", value: 0}
  ]}}));
  // invoke
  await invoke();
  // assert
  expect(seriesYieldMock).toHaveBeenCalledWith(true, {meta: {events: ["foo", "bar"]}});
});

test("doesn't raise an event if only one B3 event is detected", async () => {
  // setup
  seriesQueryMock.mockReturnValueOnce(Promise.resolve({meta: {heads: [
    {name: "foo", value: 1},
    {name: "bar", value: 0},
    {name: "baz", value: 0}
  ]}}));
  // invoke
  await invoke();
  // assert
  expect(seriesYieldMock).toHaveBeenCalledWith(false, {meta: {events: ["foo"]}});
});
