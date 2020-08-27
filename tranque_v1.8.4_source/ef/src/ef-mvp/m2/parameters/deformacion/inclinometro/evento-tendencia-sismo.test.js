
const utilsIsDefinedMock = (x) => typeof x !== "undefined";


test("script return 0 when value of tendencia is 1 and terrremoto is 0", async () => {

  const tendencia = {value: 1};
  const sismo = {value: 0};

  const seriesSaveMock = jest.fn();
  const seriesQueryMock = async ({head: name}) => ({
    "*.B*": tendencia,
    "*.sismo": sismo,
  })[name];

  const debug = (msg) => console.log("DEBUG:", msg);

  await script({
    series: {
      query: seriesQueryMock,
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


test("script return 1 when value of tendencia is 1 and terrremoto is 1", async () => {

  const tendencia = {value: 1};
  const sismo = {value: 1};

  const seriesSaveMock = jest.fn();
  const seriesQueryMock = async ({head: name}) => ({
    "*.B*": tendencia,
    "*.sismo": sismo,
  })[name];

  const debug = (msg) => console.log("DEBUG:", msg);

  await script({
    series: {
      query: seriesQueryMock,
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


test("script return 0 when value of tendencia is 0 and terrremoto is 1", async () => {

  const tendencia = {value: 0};
  const sismo = {value: 1};

  const seriesSaveMock = jest.fn();
  const seriesQueryMock = async ({head: name}) => ({
    "*.B*": tendencia,
    "*.sismo": sismo,
  })[name];

  const debug = (msg) => console.log("DEBUG:", msg);

  await script({
    series: {
      query: seriesQueryMock,
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


test("script return 0 when value of tendencia is 0 and terrremoto is 0", async () => {

  const tendencia = {value: 0};
  const sismo = {value: 0};

  const seriesSaveMock = jest.fn();
  const seriesQueryMock = async ({head: name}) => ({
    "*.B*": tendencia,
    "*.sismo": sismo,
  })[name];

  const debug = (msg) => console.log("DEBUG:", msg);

  await script({
    series: {
      query: seriesQueryMock,
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
