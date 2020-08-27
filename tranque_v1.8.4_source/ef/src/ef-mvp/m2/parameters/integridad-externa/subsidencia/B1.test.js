
const utilsIsDefinedMock = (x) => typeof x !== "undefined";

test("script return 1 when value is 1", async () => {

  const value = {value: 1};
  const muro = {value: 1};

  const seriesSaveMock = jest.fn();
  const seriesQueryMock = async ({head: name}) => ({
    "*.subsidencia": value,
    "*.subsidencia-muro": muro,
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


test("script return 0 when value is 0", async () => {

  const value = {value: 0};
  const muro = {value: 0};

  const seriesSaveMock = jest.fn();
  const seriesQueryMock = async ({head: name}) => ({
    "*.subsidencia": value,
    "*.subsidencia-muro": muro,
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
