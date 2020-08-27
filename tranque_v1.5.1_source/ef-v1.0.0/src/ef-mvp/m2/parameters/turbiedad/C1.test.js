const utilsMinutesAgoMock = jest.fn();
const refsParamMock = jest.fn();
const seriesQueryMock = jest.fn();
const seriesYieldMock = jest.fn();

const invoke = () => script({
  utils: {minutesAgo: utilsMinutesAgoMock},
  refs: {param: refsParamMock},
  series: {
    query: seriesQueryMock,
    yield: seriesYieldMock,
  },
});

test("raises an event when every input is a raised event", async () => {
  // setup
  refsParamMock.mockReturnValueOnce(Promise.resolve(1));
  seriesQueryMock
    .mockReturnValueOnce(Promise.resolve({"value": 1, "@timestamp": "2020"}))
    .mockReturnValueOnce(Promise.resolve([{value: 1}, {value: 1}, {value: 1}]));
  // invoke
  await invoke();
  // assert
  expect(seriesYieldMock).toHaveBeenCalledWith(true, {meta: {alfa: 1, latest: {"value": 1, "@timestamp": "2020"}}});
});

test("doesn't raise an event if at least one input isn't a raised event", async () => {
  // setup
  refsParamMock.mockReturnValueOnce(Promise.resolve(1));
  seriesQueryMock
    .mockReturnValueOnce(Promise.resolve({"value": 1, "@timestamp": "2020"}))
    .mockReturnValueOnce(Promise.resolve([{value: 1}, {value: 1}, {value: 0}]));
  // invoke
  await invoke();
  // assert
  expect(seriesYieldMock).toHaveBeenCalledWith(false, {meta: {alfa: 1, latest: {"value": 1, "@timestamp": "2020"}}});
});
