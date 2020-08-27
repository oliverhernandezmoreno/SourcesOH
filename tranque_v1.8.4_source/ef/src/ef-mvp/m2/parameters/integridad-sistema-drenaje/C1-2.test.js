const utilsAssertMock = (x) => x;
const seriesQueryMock = jest.fn();
const seriesYieldMock = jest.fn();

const invoke = () => script({
  utils: {assert: utilsAssertMock},
  series: {
    query: seriesQueryMock,
    yield: seriesYieldMock
  }
});

test("raises event if the input is an event and is valid", async () => {
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

test("doesn't raise event if the input is an event but is invalid", async () => {
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

test("doesn't raise event if the input is not an event", async () => {
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
