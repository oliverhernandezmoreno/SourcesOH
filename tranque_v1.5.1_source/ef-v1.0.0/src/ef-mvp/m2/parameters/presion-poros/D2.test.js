const seriesQueryMock = jest.fn();
const seriesYieldMock = jest.fn();

const invoke = () => script({
  series: {
    query: seriesQueryMock,
    yield: seriesYieldMock
  }
});

test("raises an event on valid inputs", async () => {
  // setup
  seriesQueryMock.mockReturnValueOnce(Promise.resolve({value: 1, meta: {valid: true}}));
  // invoke
  await invoke();
  // assert
  expect(seriesYieldMock).toHaveBeenCalledWith(true);
});

test("doesn't raise an event on invalid inputs", async () => {
  // setup
  seriesQueryMock.mockReturnValueOnce(Promise.resolve({value: 1, meta: {valid: false}}));
  // invoke
  await invoke();
  // assert
  expect(seriesYieldMock).toHaveBeenCalledWith(false);
});

test("doesn't raise an event on non-raising inputs", async () => {
  // setup
  seriesQueryMock.mockReturnValueOnce(Promise.resolve({value: 0, meta: {valid: true}}));
  // invoke
  await invoke();
  // assert
  expect(seriesYieldMock).toHaveBeenCalledWith(false);
});
