
const utilsIsDefinedMock = (x) => typeof x !== "undefined";
const name = "testname"

test("script return 1 when value is upper the threshold", async () => {
  const value = {value: 27, name: name + 4};
  const threshold = {
    canonical_name: name+4,
    active_thresholds: [{
      upper: 19,
    }],
  };

  const seriesSaveMock = jest.fn();
  const seriesQueryAllMock = async () => value;
  const refsGetOneMock = async () => threshold;
  const debug = (msg) => console.log("DEBUG:", msg);

  await script({
    refs: {
      getOne: refsGetOneMock,
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
  const value = {value: 15, name: name+1};
  const threshold = {
      canonical_name: name+1,
      active_thresholds: [{upper: 19}],
    };

  const seriesSaveMock = jest.fn();
  const seriesQueryAllMock = async () => value;
  const refsGetOneMock = async () => threshold;
  const debug = (msg) => console.log("DEBUG:", msg);

  await script({
    refs: {
      getOne: refsGetOneMock,
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


test("script return 0 when the threshold-upper is not defined", async () => {
  const values = [
    {value: 25},
    {value: 35},
    {value: 15},
    {value: 65},
    {value: 25},
  ];
  const threshold = {
      canonical_name: name+3,
      active_thresholds: []
    };

  const seriesSaveMock = jest.fn();
  const seriesQueryAllMock = async () => values;
  const refsGetOneMock = async () => threshold;
  const debug = (msg) => console.log("DEBUG:", msg);

  await script({
    refs: {
      getOne: refsGetOneMock,
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




test("script return 0 when the threshold-upper and active_thresholds is not defined", async () => {
  const values = [
    {value: 25},
    {value: 35},
    {value: 15},
    {value: 65},
    {value: 25},
  ];
  const threshold = {
      canonical_name: name+3,
    };

  const seriesSaveMock = jest.fn();
  const seriesQueryAllMock = async () => values;
  const refsGetOneMock = async () => threshold;
  const debug = (msg) => console.log("DEBUG:", msg);

  await script({
    refs: {
      getOne: refsGetOneMock,
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
    .toEqual(0);

});
