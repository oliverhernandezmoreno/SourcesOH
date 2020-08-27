const utilsIsDefinedMock = (x) => typeof x !== "undefined" && x !== null;
const utilsIsUndefinedMock = (x) => !utilsIsDefinedMock(x);
const utilsDiffInMinutesMock = (t1, t2) => (new Date(t1).getTime() - new Date(t2).getTime()) / 1000 / 60;
const utilsIsAfterMock = (t1, t2) => new Date(t1).getTime() > new Date(t2).getTime();

const seriesQueryMock = jest.fn();
const seriesYieldMock = jest.fn();

const invoke = () => script({
  utils: {
    isDefined: utilsIsDefinedMock,
    isUndefined: utilsIsUndefinedMock,
    diffInMinutes: utilsDiffInMinutesMock,
    isAfter: utilsIsAfterMock,
  },
  series: {
    query: seriesQueryMock,
    yield: seriesYieldMock,
  }
});

test("raises an event on manual-only activation", async () => {
  // setup
  seriesQueryMock
    .mockReturnValueOnce(Promise.resolve({meta: {}}))
    .mockReturnValueOnce(Promise.resolve({value: 1}));
  // invoke
  await invoke();
  // assert
  expect(seriesYieldMock).toHaveBeenLastCalledWith(true, {meta: {manual: true}});
});

test("raises an event on manual activation when the automatic trend is non-activating", async () => {
  // setup
  seriesQueryMock
    .mockReturnValueOnce(Promise.resolve({meta: {
      thresholds: [100],
      firstCriticalTime: 5,
      regression: {critical_dates: ["2000-01-01T16:00:00Z"]},
      head: {
        "value": 99,
        "@timestamp": "2000-01-01T10:00:00Z",
      }
    }}))
    .mockReturnValueOnce(Promise.resolve({value: 1}));
  // invoke
  await invoke();
  // assert
  expect(seriesYieldMock).toHaveBeenLastCalledWith(true, {meta: {diff: 6, manual: true}});
});

test("raises an event on automatic, activating trend", async () => {
  // setup
  seriesQueryMock
    .mockReturnValueOnce(Promise.resolve({meta: {
      thresholds: [100],
      firstCriticalTime: 5,
      regression: {critical_dates: ["2000-01-01T14:00:00Z"]},
      head: {
        "value": 99,
        "@timestamp": "2000-01-01T10:00:00Z",
      }
    }}))
    .mockReturnValueOnce(Promise.resolve({value: 0}));
  // invoke
  await invoke();
  // assert
  expect(seriesYieldMock).toHaveBeenLastCalledWith(true, {meta: {diff: 4, manual: false}});
});

test("doesn't raise an event when the trend is insufficient", async () => {
  // setup
  seriesQueryMock
    .mockReturnValueOnce(Promise.resolve({meta: {
      thresholds: [100],
      firstCriticalTime: 5,
      regression: {critical_dates: ["2000-01-01T16:00:00Z"]},
      head: {
        "value": 99,
        "@timestamp": "2000-01-01T10:00:00Z",
      }
    }}));
  // invoke
  await invoke();
  // assert
  expect(seriesYieldMock).toHaveBeenLastCalledWith(false, {meta: {diff: 6, manual: false}});
});
