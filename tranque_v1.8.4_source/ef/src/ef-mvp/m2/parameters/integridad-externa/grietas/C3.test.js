
const utilsIsDefinedMock = (x) => typeof x !== "undefined";


test("script return 0 when value of grieta is 1 and deslizamiento is 0", async () => {

  const grietas = {value: 1};
  const deslizamiento = {value: 0};

  const seriesSaveMock = jest.fn();
  const seriesQueryMock = async ({head: name}) => ({
    "*.grietas": grietas,
    "*.deslizamiento-activacion-manual": deslizamiento,
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
  // expect(seriesSaveMock.mock.calls[0][0])
  //   .toEqual(0);

});


test("script return 1 when value of grieta is 1 and deslizamiento is 1", async () => {

  const grietas = {value: 1};
  const deslizamiento = {value: 1};

  const seriesSaveMock = jest.fn();
  const seriesQueryMock = async ({head: name}) => ({
    "*.grietas": grietas,
    "*.deslizamiento-activacion-manual": deslizamiento,
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


test("script return 0 when value of grieta is 0 and deslizamiento is 1", async () => {

  const grietas = {value: 0};
  const deslizamiento = {value: 1};

  const seriesSaveMock = jest.fn();
  const seriesQueryMock = async ({head: name}) => ({
    "*.grietas": grietas,
    "*.deslizamiento-activacion-manual": deslizamiento,
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


test("script return 0 when value of grieta is 0 and deslizamiento is 0", async () => {

  const grietas = {value: 0};
  const deslizamiento = {value: 0};

  const seriesSaveMock = jest.fn();
  const seriesQueryMock = async ({head: name}) => ({
    "*.grietas": grietas,
    "*.deslizamiento-activacion-manual": deslizamiento,
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
