const date = (() => {
  const now = (new Date()).getTime();
  return (t) => (new Date(now + t)).toJSON()
})();

const utilsIsDefinedMock = (x) => typeof x !== "undefined";
const utilsIsUndefinedMock = (x) => !utilsIsDefinedMock(x);

const utilsMinutesAgoMock = (t, m) => (new Date((new Date(t)).getTime() - m * 1000 * 60)).toJSON();

const seriesCurrentMock = jest.fn();
const seriesQueryMock = jest.fn();


it("reacts instantly to rain changes when the trigger and threshold are absent", async () => {
  const fakeData = [
    {"@timestamp": date(10), "value": 0},
    {"@timestamp": date(9), "value": 0.001},
    {"@timestamp": date(8), "value": 0},
    {"@timestamp": date(7), "value": 0},
    {"@timestamp": date(6), "value": 900},
    {"@timestamp": date(5), "value": 800},
    {"@timestamp": date(4), "value": 700},
    {"@timestamp": date(3), "value": 600},
    {"@timestamp": date(2), "value": 0},
    {"@timestamp": date(1), "value": 0},
    {"@timestamp": date(0), "value": 0},
  ];
  seriesCurrentMock.mockReturnValueOnce(fakeData);
  const seriesYieldMock = jest.fn();
  await script({
    ctx: {rootRef: {active_thresholds: []}},
    utils: {isDefined: utilsIsDefinedMock, isUndefined: utilsIsUndefinedMock},
    series: {current: seriesCurrentMock, query: seriesQueryMock, yield: seriesYieldMock},
  });
  expect(seriesYieldMock).toHaveBeenCalledTimes(fakeData.length);
  Array.from({length: fakeData.length}, (_, i) => i + 1)
    .forEach((nth) => expect(seriesYieldMock).toHaveBeenNthCalledWith(
      nth,
      fakeData[fakeData.length - nth].value > 0,
      {timestamp: fakeData[fakeData.length - nth]["@timestamp"]},
    ));
});


it("reacts to rain changes according to the threshold", async () => {
  const fakeData = [
    {"@timestamp": date(10 * 1000 * 60 * 60), "value": 0},
    {"@timestamp": date(9 * 1000 * 60 * 60), "value": 0.001},
    {"@timestamp": date(8 * 1000 * 60 * 60), "value": 0},
    {"@timestamp": date(7 * 1000 * 60 * 60), "value": 0},
    {"@timestamp": date(6 * 1000 * 60 * 60), "value": 900},
    {"@timestamp": date(5 * 1000 * 60 * 60), "value": 800},
    {"@timestamp": date(4 * 1000 * 60 * 60), "value": 700},
    {"@timestamp": date(3 * 1000 * 60 * 60), "value": 600},
    {"@timestamp": date(2 * 1000 * 60 * 60), "value": 500},
    {"@timestamp": date(1 * 1000 * 60 * 60), "value": 0},
    {"@timestamp": date(0), "value": 300},
  ];
  seriesCurrentMock.mockReturnValueOnce(fakeData);
  seriesQueryMock
    .mockReturnValueOnce(Promise.resolve({"@timestamp": date(8 * 1000 * 60 * 60), "value": 0}))  // disabled trigger
    .mockImplementation(({since, until}) => Promise.resolve(fakeData.filter(
      (e) => e["@timestamp"] >= since && e["@timestamp"] <= until
    )));
  const seriesYieldMock = jest.fn();
  await script({
    ctx: {rootRef: {active_thresholds: [{upper: "60.00"}]}},
    utils: {
      isDefined: utilsIsDefinedMock,
      isUndefined: utilsIsUndefinedMock,
      minutesAgo: utilsMinutesAgoMock,
    },
    series: {current: seriesCurrentMock, query: seriesQueryMock, yield: seriesYieldMock},
  });
  // [expected time, expected event]
  const expected = [
    [0, true],
    [1, true],
    [2, true],
    [3, true],
    [4, true],
    [5, true],
    [6, true],
    [7, true],
    [8, false],
    [9, true],
    [10, true],
  ];
  expect(seriesYieldMock).toHaveBeenCalledTimes(expected.length);
  expected
    .forEach(([t, v], index) => expect(seriesYieldMock).toHaveBeenNthCalledWith(
      index + 1,
      v,
      {timestamp: date(t * 1000 * 60 * 60)},
    ));
});


it("reacts to rain but gives precedence to the trigger", async () => {
  const fakeData = [
    {"@timestamp": date(10), "value": 0},
    {"@timestamp": date(9), "value": 0},
    {"@timestamp": date(8), "value": 0},
    {"@timestamp": date(7), "value": 0},
    {"@timestamp": date(6), "value": 900},
    {"@timestamp": date(5), "value": 800},
    {"@timestamp": date(4), "value": 700},
    {"@timestamp": date(3), "value": 600},
    {"@timestamp": date(2), "value": 0},
    {"@timestamp": date(1), "value": 0},
    {"@timestamp": date(0), "value": 0},
  ];
  seriesCurrentMock.mockReturnValueOnce(fakeData);
  seriesQueryMock
    .mockReturnValueOnce(Promise.resolve({"@timestamp": date(8), "value": 1}));
  const seriesYieldMock = jest.fn();
  await script({
    ctx: {rootRef: {active_thresholds: []}},
    utils: {isDefined: utilsIsDefinedMock, isUndefined: utilsIsUndefinedMock},
    series: {current: seriesCurrentMock, query: seriesQueryMock, yield: seriesYieldMock},
  });
  expect(seriesYieldMock).toHaveBeenCalledTimes(fakeData.length);
  Array.from({length: fakeData.length}, (_, i) => i + 1)
    .filter((nth) => nth < 9)
    .forEach((nth) => expect(seriesYieldMock).toHaveBeenNthCalledWith(
      nth,
      fakeData[fakeData.length - nth].value > 0,
      {timestamp: fakeData[fakeData.length - nth]["@timestamp"]},
    ));
  expect(seriesYieldMock).toHaveBeenNthCalledWith(9, true, {timestamp: date(8)});
  expect(seriesYieldMock).toHaveBeenNthCalledWith(10, true, {timestamp: date(9)});
  expect(seriesYieldMock).toHaveBeenNthCalledWith(11, true, {timestamp: date(10)});
});
