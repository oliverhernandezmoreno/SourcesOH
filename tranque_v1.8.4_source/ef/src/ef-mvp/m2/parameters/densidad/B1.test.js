
const utilsIsDefinedMock = (x) => typeof x !== "undefined";

test("script return 0 when value isn't lower the threshold", async () => {
  const value = {value: 97};
  const threshold = {
    active_thresholds: [{
      lower: 95,
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
    .toEqual(0);

});


test("script return 1 when value is lower the threshold", async () => {
  const value = {value: 92, name: name+1};
  const threshold = {
    active_thresholds: [{
      lower: 95,
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


test("script return 1 when value is lower the list of thresholds", async () => {
  const value = {value: 96};
  const threshold = {
    active_thresholds: [{
      lower: 95,
    },
    {
      lower: 97,
    },
    {
      lower: 96,
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


test("script return 1 when value is lower the list of thresholds", async () => {
  const value = {value: 94};
  const threshold = {
    active_thresholds: [{
      lower: 95,
    },
    {
      lower: 97,
    },
    {
      lower: 96,
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
