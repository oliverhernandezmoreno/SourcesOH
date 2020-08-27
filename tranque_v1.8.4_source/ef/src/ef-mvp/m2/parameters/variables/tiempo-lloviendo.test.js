const date = (() => {
  const now = (new Date()).getTime();
  return (t) => (new Date(now + (t * 1000))).toJSON()
})();

const utilsIsDefinedMock = (x) => typeof x !== "undefined";
const utilsIsUndefinedMock = (x) => !utilsIsDefinedMock(x);

const utilsDiffInSecondsMock = (t1, t2) => ((new Date(t1)).getTime() - (new Date(t2)).getTime()) / 1000;

const seriesQueryMock = jest.fn();
const seriesEarliestMock = jest.fn();


it("saves the delta of rain periods under normal cirumstances", async () => {
  const seriesYieldMock = jest.fn();
  seriesQueryMock
    .mockReturnValueOnce(Promise.resolve({"@timestamp": date(10), "value": 1}))   // the latest state
    .mockReturnValueOnce(Promise.resolve({"@timestamp": date(7), "value": 0}))    // the latest non-rainy state
    .mockReturnValueOnce(Promise.resolve({"@timestamp": date(10), "value": 1}))   // the latest rainy state
    .mockReturnValueOnce(Promise.resolve([{"@timestamp": date(7), "value": 0}])); // the previous non-rainy state
  seriesEarliestMock
    .mockReturnValueOnce(Promise.resolve([{"@timestamp": date(8), "value": 1}])); // the start of the rainy state
  seriesQueryMock
    .mockReturnValueOnce(Promise.resolve())                                       // the (absent) correction
    .mockReturnValueOnce(Promise.resolve([]));                                    // the previous rainy state
  seriesEarliestMock
    .mockReturnValueOnce(Promise.resolve([{"@timestamp": date(0), "value": 0}])); // the start of the non-rainy state
  await script({
    utils: {
      isDefined: utilsIsDefinedMock,
      isUndefined: utilsIsUndefinedMock,
      diffInSeconds: utilsDiffInSecondsMock
    },
    series: {query: seriesQueryMock, earliest: seriesEarliestMock, yield: seriesYieldMock},
  });
  expect(seriesYieldMock).toHaveBeenCalledWith(2, {meta: {startOfRain: date(8)}});
});


it("saves the delta of current rain timestamp and corrected, forwarded start-of-rain", async () => {
  const seriesYieldMock = jest.fn();
  seriesQueryMock
    .mockReturnValueOnce(Promise.resolve({"@timestamp": date(10), "value": 1}))   // the latest state
    .mockReturnValueOnce(Promise.resolve({"@timestamp": date(7), "value": 0}))    // the latest non-rainy state
    .mockReturnValueOnce(Promise.resolve({"@timestamp": date(10), "value": 1}))   // the latest rainy state
    .mockReturnValueOnce(Promise.resolve([{"@timestamp": date(7), "value": 0}])); // the previous non-rainy state
  seriesEarliestMock
    .mockReturnValueOnce(Promise.resolve([{"@timestamp": date(8), "value": 1}])); // the start of the rainy state
  seriesQueryMock
    .mockReturnValueOnce(Promise.resolve({"@timestamp": date(8.5), "value": 1}))  // the correction
    .mockReturnValueOnce(Promise.resolve([]));                                    // the previous rainy state
  seriesEarliestMock
    .mockReturnValueOnce(Promise.resolve([{"@timestamp": date(0), "value": 0}])); // the start of the non-rainy state
  await script({
    utils: {
      isDefined: utilsIsDefinedMock,
      isUndefined: utilsIsUndefinedMock,
      diffInSeconds: utilsDiffInSecondsMock
    },
    series: {query: seriesQueryMock, earliest: seriesEarliestMock, yield: seriesYieldMock},
  });
  expect(seriesYieldMock).toHaveBeenCalledWith(1.5, {meta: {startOfRain: date(8.5)}});
});


it("saves the delta of current rain timestamp and corrected, delayed start-of-rain", async () => {
  const seriesYieldMock = jest.fn();
  seriesQueryMock
    .mockReturnValueOnce(Promise.resolve({"@timestamp": date(10), "value": 1}))   // the latest state
    .mockReturnValueOnce(Promise.resolve({"@timestamp": date(7), "value": 0}))    // the latest non-rainy state
    .mockReturnValueOnce(Promise.resolve({"@timestamp": date(10), "value": 1}))   // the latest rainy state
    .mockReturnValueOnce(Promise.resolve([{"@timestamp": date(7), "value": 0}])); // the previous non-rainy state
  seriesEarliestMock
    .mockReturnValueOnce(Promise.resolve([{"@timestamp": date(8), "value": 1}])); // the start of the rainy state
  seriesQueryMock
    .mockReturnValueOnce(Promise.resolve({"@timestamp": date(5), "value": 1}))    // the correction
    .mockReturnValueOnce(Promise.resolve([]));                                    // the previous rainy state
  seriesEarliestMock
    .mockReturnValueOnce(Promise.resolve([{"@timestamp": date(0), "value": 0}])); // the start of the non-rainy state
  await script({
    utils: {
      isDefined: utilsIsDefinedMock,
      isUndefined: utilsIsUndefinedMock,
      diffInSeconds: utilsDiffInSecondsMock
    },
    series: {query: seriesQueryMock, earliest: seriesEarliestMock, yield: seriesYieldMock},
  });
  expect(seriesYieldMock).toHaveBeenCalledWith(5, {meta: {startOfRain: date(5)}});
});


it("ignores the correction for start-of-rain if it lays before the latest dry period", async () => {
  const seriesYieldMock = jest.fn();
  seriesQueryMock
    .mockReturnValueOnce(Promise.resolve({"@timestamp": date(10), "value": 1}))   // the latest state
    .mockReturnValueOnce(Promise.resolve({"@timestamp": date(7), "value": 0}))    // the latest non-rainy state
    .mockReturnValueOnce(Promise.resolve({"@timestamp": date(10), "value": 1}))   // the latest rainy state
    .mockReturnValueOnce(Promise.resolve([{"@timestamp": date(7), "value": 0}])); // the previous non-rainy state
  seriesEarliestMock
    .mockReturnValueOnce(Promise.resolve([{"@timestamp": date(8), "value": 1}])); // the start of the rainy state
  seriesQueryMock
    .mockReturnValueOnce(Promise.resolve({"@timestamp": date(-1), "value": 1}))   // the correction
    .mockReturnValueOnce(Promise.resolve([]));                                    // the previous rainy state
  seriesEarliestMock
    .mockReturnValueOnce(Promise.resolve([{"@timestamp": date(0), "value": 0}])); // the start of the non-rainy state
  await script({
    utils: {
      isDefined: utilsIsDefinedMock,
      isUndefined: utilsIsUndefinedMock,
      diffInSeconds: utilsDiffInSecondsMock
    },
    series: {query: seriesQueryMock, earliest: seriesEarliestMock, yield: seriesYieldMock},
  });
  expect(seriesYieldMock).toHaveBeenCalledWith(2, {meta: {startOfRain: date(8)}});
});
