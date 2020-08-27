const utilsIsDefinedMock = (x) => typeof x !== "undefined";



test("script return 0 when value is not upper the threshold is two", async () => {

  const daysAgo = async () => "2020-06-25T00:00:00";
  const until = {value: 19, "@timestamp": "2020-07-31T00:00:00+00:00"};

  const values = [
    {value: 19, "@timestamp": "2020-07-31T00:00:00+00:00"},
    {value: 16, "@timestamp": "2020-07-24T00:00:00+00:00"},
    {value: 14, "@timestamp": "2020-07-17T00:00:00+00:00"},
    {value: 10, "@timestamp": "2020-07-10T00:00:00+00:00"},
    {value: 7, "@timestamp": "2020-07-03T00:00:00+00:00"},
    {value: 4, "@timestamp": "2020-06-26T00:00:00+00:00"},
  ];


  const threshold = {
    canonical_name: name,
    active_thresholds: [
      {upper: 55},
      {upper: 50},
      {upper: 85},
    ]
  };

  const seriesQueryMock = async (query) => {
    if (query.head !== undefined)
      return until;
    else
      return values;
  };
  const refsGetOneMock = async () => threshold;
  const seriesSaveMock = jest.fn();
  const debug = (msg) => console.log("DEBUG:", msg);

  const slopeExpected = {
    slope: [0.0000050076],
    intercept: [-7973.5946],
    critical_timestamps: [1602296694.3396],
    critical_dates: ["2020-10-10T02:24:54+00:00"]
  };


  const statsMock = async () => slopeExpected;

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
      stats: statsMock,
      debug: debug,
      minutesAgo: daysAgo,
    },
  });

  // Asserts with the result slope
  expect(seriesSaveMock.mock.calls.length).toEqual(1);
  expect(seriesSaveMock.mock.calls[0][0]).toEqual(1);
  expect(seriesSaveMock.mock.calls[0][1]['meta']['threshold']).toEqual(50);
  expect(seriesSaveMock.mock.calls[0][1]['meta']['linear_regression']['critical_dates'][0]).toEqual(slopeExpected.critical_dates[0]);

});




test("script return 1 when value is upper the threshold is two", async () => {

  const daysAgo = async () => "2020-10-01T00:00:00.000Z";
  const until = {value: 47, "@timestamp": "2020-11-06T00:00:00+00:00"};

  const values = [
    {value: 47, "@timestamp": "2020-11-06T00:00:00+00:00"},
    {value: 46, "@timestamp": "2020-10-30T00:00:00+00:00"},
    {value: 45, "@timestamp": "2020-10-23T00:00:00+00:00"},
    {value: 44, "@timestamp": "2020-10-16T00:00:00+00:00"},
    {value: 42, "@timestamp": "2020-10-09T00:00:00+00:00"},
    {value: 40, "@timestamp": "2020-10-02T00:00:00+00:00"},
  ];

  const threshold = {
    canonical_name: name,
    active_thresholds: [
      {upper: 55},
      {upper: 50},
      {upper: 85},
    ]
  };

  const seriesQueryMock = async (query) => {
    if (query.head !== undefined)
      return until;
    else
      return values;
  };
  const refsGetOneMock = async () => threshold;
  const seriesSaveMock = jest.fn();
  const debug = (msg) => console.log("DEBUG:", msg);

  const slopeExpected = {
    slope: [0.0000022676],
    intercept: [-3591.1673],
    critical_timestamps: [1605754800],
    critical_dates: ["2020-11-19T03:00:00+00:00"]
  };


  const statsMock = async () => slopeExpected;

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
      stats: statsMock,
      debug: debug,
      minutesAgo: daysAgo,
    },
  });

  // Asserts with the result slope
  expect(seriesSaveMock.mock.calls.length).toEqual(1);
  expect(seriesSaveMock.mock.calls[0][0]).toEqual(1);
  expect(seriesSaveMock.mock.calls[0][1]['meta']['threshold']).toEqual(50);
  expect(seriesSaveMock.mock.calls[0][1]['meta']['linear_regression']['critical_dates'][0]).toEqual(slopeExpected.critical_dates[0]);


});
