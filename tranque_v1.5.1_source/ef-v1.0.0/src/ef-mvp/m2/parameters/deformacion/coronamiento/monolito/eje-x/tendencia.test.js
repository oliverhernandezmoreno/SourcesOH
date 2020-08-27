const utilsIsDefinedMock = (x) => typeof x !== "undefined";


test("script return 1 when value is upper the threshold is two", async () => {

  const daysAgo = async () => "2020-02-04 00:00:00";
  const until = {value: 40, "@timestamp": "2020-02-21 00:00:00"}; // "2020-03-11 00:00:00"};

  const values = [
    {value: 10, "@timestamp": "2020-02-05 00:00:00"},
    {value: 16, "@timestamp": "2020-02-10 00:00:00"},
    {value: 19, "@timestamp": "2020-02-13 00:00:00"},
    {value: 27, "@timestamp": "2020-02-18 00:00:00"},
    {value: 40, "@timestamp": "2020-02-21 00:00:00"},
    {value: 42, "@timestamp": "2020-02-26 00:00:00"},
    {value: 45, "@timestamp": "2020-03-02 00:00:00"},
    {value: 55, "@timestamp": "2020-03-06 00:00:00"},
    {value: 80, "@timestamp": "2020-03-11 00:00:00"},
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
    slope: 2.075371e-05,
    intercept:-32802.3,
    critical_timestamps: [1582960240]
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
      daysAgo: daysAgo,
    },
  });

  // Asserts with the result slope
  expect(seriesSaveMock.mock.calls.length).toEqual(1);
  // console.log('seriesSaveMock.mock.calls[0][1]', seriesSaveMock.mock.calls[0][1]);
  // console.log('linear_regression', seriesSaveMock.mock.calls[0][1]['linear_regression']);
  expect(seriesSaveMock.mock.calls[0][0]).toEqual(slopeExpected.critical_timestamps[0]);
  // expect(seriesSaveMock.mock.calls[0][1].linear_regression.slope).toEqual(slopeExpected.slope);
  // expect(seriesSaveMock.mock.calls[0][1].linear_regression.intercept).toEqual(slopeExpected.intercept);


});

test("script return 0 when value is not upper the threshold is two", async () => {

  const daysAgo = async () => "2017-12-23T00:00:00+00:00";
  const until = {value: 10, "@timestamp": "2018-01-28T00:00:00+00:00"}; // "2020-03-11 00:00:00"};

  const values = [
    {value: 10, "@timestamp": "2018-01-28T00:00:00+00:00"},
    {value: 7, "@timestamp": "2018-01-21T00:00:00+00:00"},
    {value: 7, "@timestamp": "2018-01-14T00:00:00+00:00"},
    {value: 5, "@timestamp": "2018-01-07T00:00:00+00:00"},
    {value: 5, "@timestamp": "2017-12-31T00:00:00+00:00"},
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
    slope: 0.0000019841,
    intercept:-3000.9143,
    critical_timestamps: [1535140800]
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
      daysAgo: daysAgo,
    },
  });

  // Asserts with the result slope
  expect(seriesSaveMock.mock.calls.length).toEqual(1);
  expect(seriesSaveMock.mock.calls[0][0]).toEqual(slopeExpected.critical_timestamps[0]);
  // expect(seriesSaveMock.mock.calls[0][1].linear_regression.slope).toEqual(slopeExpected.slope);
  // expect(seriesSaveMock.mock.calls[0][1].linear_regression.intercept).toEqual(slopeExpected.intercept);


});




test("script return 1 when value is upper the threshold is two", async () => {

  const daysAgo = async () => "2018-02-17T00:00:00";
  const until = {value: 56, "@timestamp": "2018-03-25T00:00:00+00:00"};

  const values = [
    {value: 56, "@timestamp": "2018-03-25T00:00:00+00:00"},
    {value: 51, "@timestamp": "2018-03-18T00:00:00+00:00"},
    {value: 45, "@timestamp": "2018-03-11T00:00:00+00:00"},
    {value: 42, "@timestamp": "2018-03-04T00:00:00+00:00"},
    {value: 40, "@timestamp": "2018-02-25T00:00:00+00:00"},
    {value: 27, "@timestamp": "2018-02-18T00:00:00+00:00"},
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
    slope: 0.0000085506,
    intercept:-12957.102,
    critical_timestamps: [1520599425.4144]
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
      daysAgo: daysAgo,
    },
  });

  // Asserts with the result slope
  expect(seriesSaveMock.mock.calls.length).toEqual(1);
  expect(seriesSaveMock.mock.calls[0][0]).toEqual(slopeExpected.critical_timestamps[0]);
  // expect(seriesSaveMock.mock.calls[0][1].linear_regression.slope).toEqual(slopeExpected.slope);
  // expect(seriesSaveMock.mock.calls[0][1].linear_regression.intercept).toEqual(slopeExpected.intercept);


});
