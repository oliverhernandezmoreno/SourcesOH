
const utilsIsDefinedMock = (x) => typeof x !== "undefined";
const utilsIsUndefinedMock = (x) => typeof x === "undefined";
const name = "testname"

test("script return 0 when value is not upper the threshold", async () => {
  const threshold_trend = 50;
  const linear_regression = {critical_dates: ["2020-10-26T18:27:41+00:00"]}
  const until = {value: 19, "@timestamp": "2020-07-31T00:00:00+00:00"};
  const value = {value: 0, meta: {
    threshold: threshold_trend,
    linear_regression: linear_regression,
    until: until}
  };

  const threshold = {
    canonical_name: name,
    active_thresholds: [
      {
        upper: 21,
      },
    ],
  };

  const seriesSaveMock = jest.fn();
  const seriesQueryMock = async () => value;
  const refsGetOneMock = async () => threshold;
  const daysAgo = async () => "2020-10-11T18:27:41";
  const isAfter = async (day1, day2) => {
    // console.log("false isAfter(", day1, day2, ")");
    return false;
  }
  const debug = (msg) => console.log("DEBUG:", msg);

  await script({
    refs: {
      getOne: refsGetOneMock,
    },
    series: {
      query: seriesQueryMock,
      yield: seriesSaveMock,
    },
    utils: {
      isDefined: utilsIsDefinedMock,
      isUndefined: utilsIsUndefinedMock,
      debug: debug,
      minutesAgo: daysAgo,
      isAfter: isAfter,
    },
  });

  // assert
  expect(seriesSaveMock.mock.calls.length)
    .toEqual(1);
  expect(seriesSaveMock.mock.calls[0][0])
    .toEqual(0);

});


test("script return 1 when value is upper the threshold", async () => {
  const threshold_trend = 50;
  const linear_regression = {critical_dates: ["2020-11-19T03:00:00+00:00"]}
  const until = {value: 47, "@timestamp": "2020-11-06T00:00:00+00:00"};
  const value = {value: 1, meta: {
    threshold: threshold_trend,
    linear_regression: linear_regression,
    until: until}
  };

  const threshold = {
    canonical_name: name,
    active_thresholds: [
      {
        upper: 21,
      },
    ],
  };

  const seriesSaveMock = jest.fn();
  const seriesQueryMock = async () => value;
  const refsGetOneMock = async () => threshold;
  const daysAgo = async () => "2020-11-04T03:00:00";
  const isAfter = async (day1, day2) => {
    // console.log("true isAfter(", day1, day2, ")");
    return true;
  }
  const debug = (msg) => console.log("DEBUG:", msg);

  await script({
    refs: {
      getOne: refsGetOneMock,
    },
    series: {
      query: seriesQueryMock,
      yield: seriesSaveMock,
    },
    utils: {
      isDefined: utilsIsDefinedMock,
      isUndefined: utilsIsUndefinedMock,
      debug: debug,
      minutesAgo: daysAgo,
      isAfter: isAfter,
    },
  });

  // console.log('return 1 [0][0]', seriesSaveMock.mock.calls[0][0]);
  // console.log('         [0][1]', seriesSaveMock.mock.calls[0][1]);

  // assert
  expect(seriesSaveMock.mock.calls.length)
    .toEqual(1);
  expect(seriesSaveMock.mock.calls[0][0])
    .toEqual(1);

});
