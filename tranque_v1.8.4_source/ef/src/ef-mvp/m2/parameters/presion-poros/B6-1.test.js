const seriesQueryMock = jest.fn();
const seriesYieldMock = jest.fn();

const invoke = () => script({
  series: {
    query: seriesQueryMock,
    yield: seriesYieldMock
  }
});

test("raises an event on valid input events", async () => {
  // setup
  seriesQueryMock.mockReturnValueOnce(Promise.resolve({
    value: 1,
    meta: {valid: true}
  }));
  // invoke
  await invoke();
  // assert
  expect(seriesYieldMock).toHaveBeenCalledWith(true, {meta: {value: 1, valid: true}});
});

test("doesn't raise an event on invalid input events", async () => {
  // setup
  seriesQueryMock.mockReturnValueOnce(Promise.resolve({
    value: 1,
    meta: {valid: false}
  }));
  // invoke
  await invoke();
  // assert
  expect(seriesYieldMock).toHaveBeenCalledWith(false, {meta: {value: 1, valid: false}});
});

test("doesn't raise an event on non events", async () => {
  // setup
  seriesQueryMock.mockReturnValueOnce(Promise.resolve({
    value: 0,
    meta: {valid: true}
  }));
  // invoke
  await invoke();
  // assert
  expect(seriesYieldMock).toHaveBeenCalledWith(false, {meta: {value: 0, valid: true}});
});
