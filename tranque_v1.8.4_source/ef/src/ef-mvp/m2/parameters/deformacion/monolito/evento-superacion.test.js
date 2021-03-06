
const utilsIsDefinedMock = (x) => typeof x !== "undefined";
const name = "testname"

test("script return 1 when value is upper the threshold", async () => {
  const value = {value: 0.65, name: name + 4};
  const threshold = {
    canonical_name: name+4,
    active_thresholds: [{
      upper: 0.5,
    }],
  };

  const seriesSaveMock = jest.fn();
  const seriesQueryAllMock = async () => value;
  const refsGetManyMock = async () => threshold;
  const debug = (msg) => console.log("DEBUG:", msg);

  await script({
    refs: {
      getOne: refsGetManyMock,
    },
    series: {
      query: seriesQueryAllMock,
      yield: seriesSaveMock,
    },
    utils: {
      isDefined: utilsIsDefinedMock,
      debug: debug,
    },
  });

  // assert
  expect(seriesSaveMock.mock.calls.length)
    .toEqual(1);
  expect(seriesSaveMock.mock.calls[0][0])
    .toEqual(1);

});


test("script return 0 when value isn't upper the threshold", async () => {
  const value = {value: 0.25, name: name+1};
  const thresholds = [
    {
      canonical_name: name+1,
      active_thresholds: {upper: 0.3},
    },
    {
      canonical_name: name+2,
      active_thresholds: {
        upper: 0.3,
      },
    },
    {
      canonical_name: name+3,
      active_thresholds: {
        upper: 0.3,
      },
    },
    {
      canonical_name: name+4,
      active_thresholds: {
        upper: 0.5,
      },
    },
    {
      canonical_name: name+5,
      active_thresholds: {
        upper: 0.4,
      },
    },
    {
      canonical_name: name+6,
      active_thresholds: {
        upper: 0.2,
      },
    },
  ];

  const seriesSaveMock = jest.fn();
  const seriesQueryAllMock = async () => value;
  const refsGetManyMock = async () => thresholds;
  const debug = (msg) => console.log("DEBUG:", msg);

  await script({
    refs: {
      getOne: refsGetManyMock,
    },
    series: {
      query: seriesQueryAllMock,
      yield: seriesSaveMock,
    },
    utils: {
      isDefined: utilsIsDefinedMock,
      debug: debug,
    },
  });

  // assert
  expect(seriesSaveMock.mock.calls.length)
    .toEqual(1);
  expect(seriesSaveMock.mock.calls[0][0])
    .toEqual(0);

});


test("script return 0 when the threshold-upper or active_thresholds is not defined", async () => {
  const values = [
    {value: 0.25, name: name+1},
    {value: 0.35, name: name+2},  // >
    {value: 0.15, name: name+3},
    {value: 0.65, name: name+4},  // >
    {value: 0.25, name: name+5},
  ];
  const thresholds = [
    {
      canonical_name: name+1,
      active_thresholds: [],
    },
    {
      canonical_name: name+2,
      active_thresholds: [],
    },
    {
      canonical_name: name+3,
    },
    {
      canonical_name: name+4,
      active_thresholds: [],
    },
    {
      canonical_name: name+5,
      active_thresholds: [],
    },
    {
      canonical_name: name+6,
      active_thresholds: [],
    },
  ];

  const seriesSaveMock = jest.fn();
  const seriesQueryAllMock = async () => values;
  const refsGetManyMock = async () => thresholds;
  const debug = (msg) => console.log("DEBUG:", msg);

  await script({
    refs: {
      getOne: refsGetManyMock,
    },
    series: {
      query: seriesQueryAllMock,
      yield: seriesSaveMock,
    },
    utils: {
      isDefined: utilsIsDefinedMock,
      debug: debug,
    },
  });

  // assert
  expect(seriesSaveMock.mock.calls.length)
    .toEqual(1);
  expect(seriesSaveMock.mock.calls[0][0])
    .toEqual(0);

});
