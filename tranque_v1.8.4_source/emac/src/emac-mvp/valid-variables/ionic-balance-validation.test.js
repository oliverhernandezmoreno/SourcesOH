const refsMatchMock = () => "test-prefix.ionic-balance";

const refsExpandMock = () => [
  "test-prefix.ionic-balance",
  "test-prefix.some-variable",
];

const MAX_IONIC_BALANCE = 5;

const refsGetOneMock = async (name) => ({
  "test-prefix.ionic-balance": {
    active_thresholds: [{
      upper: `${MAX_IONIC_BALANCE}`,
    }],
  },
  "test-prefix.some-variable": {
    range_gt: null,
    range_gte: "0.001",
    range_lt: "100",
    range_lte: null,
    validity_intervals: [{
      from: "2017",
      to: "2017-05",
    }, {
      from: "2017-06",
      to: "__EoT__",
    }],
  },
})[name];

const utilsIsDefined = (x) => typeof x !== "undefined";

const utilsTimestampInInterval = (t, t1, t2) => {
  let inside = true;
  const s = (new Date(t)).getTime();
  if (t1.toLowerCase() !== "__bot__") {
    inside = inside && (s >= (new Date(t1)).getTime());
  }
  if (t2.toLowerCase() !== "__eot__") {
    inside = inside && (s <= (new Date(t2)).getTime());
  }
  return inside;
};


test("script yields when ionic balance is low", async () => {
  const seriesCurrentMock = (name) => ({
    "test-prefix.some-variable": [
      {value: 1, "@timestamp": "2018"},
      {value: 2, "@timestamp": "2019"},
      {value: 3, "@timestamp": "2020"},
    ],
  })[name];
  const seriesQueryMock = async ({head}) => ({
    "test-prefix.ionic-balance": {value: MAX_IONIC_BALANCE - 0.1},
  })[head];
  const seriesSaveMock = jest.fn();
  await script({
    utils: {
      isDefined: utilsIsDefined,
      timestampInInterval: utilsTimestampInInterval,
    },
    refs: {
      match: refsMatchMock,
      expand: refsExpandMock,
      getOne: refsGetOneMock,
    },
    series: {
      current: seriesCurrentMock,
      query: seriesQueryMock,
      save: seriesSaveMock,
    },
  });
  // assert
  expect(seriesSaveMock.mock.calls.length)
    .toEqual(3);
  expect(seriesSaveMock.mock.calls.map((call) => call[0]))
    .toEqual([1, 2, 3]);
  expect(seriesSaveMock.mock.calls.map((call) => call[1]))
    .toEqual(["2018", "2019", "2020"]);
});

test("script filters events out of validity intervals", async () => {
  const seriesCurrentMock = (name) => ({
    "test-prefix.some-variable": [
      {value: 1, "@timestamp": "2017-05-02"},
      {value: 2, "@timestamp": "2017-06"},
      {value: 3, "@timestamp": "2015"},
      {value: 100, "@timestamp": "2019"},
      {value: 0, "@timestamp": "2020"},
    ],
  })[name];
  const seriesQueryMock = async ({head}) => ({
    "test-prefix.ionic-balance": {value: MAX_IONIC_BALANCE - 0.1},
  })[head];
  const seriesSaveMock = jest.fn();
  await script({
    utils: {
      isDefined: utilsIsDefined,
      timestampInInterval: utilsTimestampInInterval,
    },
    refs: {
      match: refsMatchMock,
      expand: refsExpandMock,
      getOne: refsGetOneMock,
    },
    series: {
      current: seriesCurrentMock,
      query: seriesQueryMock,
      save: seriesSaveMock,
    },
  });
  // assert
  expect(seriesSaveMock.mock.calls.length)
    .toEqual(1);
  expect(seriesSaveMock.mock.calls.map((call) => call[0]))
    .toEqual([2]);
  expect(seriesSaveMock.mock.calls.map((call) => call[1]))
    .toEqual(["2017-06"]);
});

test("script filters all events when ionic balance is high", async () => {
  const seriesCurrentMock = (name) => ({
    "test-prefix.some-variable": [
      {value: 1, "@timestamp": "2018"},
      {value: 2, "@timestamp": "2019"},
      {value: 3, "@timestamp": "2020"},
    ],
  })[name];
  const seriesQueryMock = async ({head}) => ({
    "test-prefix.ionic-balance": {value: MAX_IONIC_BALANCE + 0.1},
  })[head];
  const seriesSaveMock = jest.fn();
  await script({
    utils: {
      isDefined: utilsIsDefined,
      timestampInInterval: utilsTimestampInInterval,
    },
    refs: {
      match: refsMatchMock,
      expand: refsExpandMock,
      getOne: refsGetOneMock,
    },
    series: {
      current: seriesCurrentMock,
      query: seriesQueryMock,
      save: seriesSaveMock,
    },
  });
  // assert
  expect(seriesSaveMock.mock.calls.length)
    .toEqual(0);
});
