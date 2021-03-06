const utilsIsDefinedMock = (x) => typeof x !== "undefined";

const DOCUMENTO_NO_EXISTE_YES = + true;  // 1
const DOCUMENTO_NO_EXISTE_NO  = + false; // 0

test("script return true when " +
  "No se tiene información asociada al cumplimiento de las características de diseño del sistema de drenaje", async () => {
  const expected = Boolean(DOCUMENTO_NO_EXISTE_YES);
  const last = {value: DOCUMENTO_NO_EXISTE_YES};

  const seriesSaveMock = jest.fn();
  const seriesQueryMock = async () => last;

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
    .toEqual(expected);
});

test("script return false when " +
  "No se tiene información asociada al cumplimiento de las características de diseño del sistema de drenaje", async () => {
  const expected = Boolean(DOCUMENTO_NO_EXISTE_NO);
  const last = {value: DOCUMENTO_NO_EXISTE_NO};

  const seriesSaveMock = jest.fn();
  const seriesQueryMock = async () => last;

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
    .toEqual(expected);
});
