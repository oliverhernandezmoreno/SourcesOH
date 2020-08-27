const utilsIsDefinedMock = (x) => typeof x !== "undefined";

const INFORMACION_PARCIAL_YES = + true;  // 1
const INFORMACION_PARCIAL_NO  = + false; // 0

test("script return true when " +
  "Se dispone de información parcial del cumplimiento de las características de diseño del sistema de drenaje", async () => {
  const expected = Boolean(INFORMACION_PARCIAL_YES);
  const last = {value: INFORMACION_PARCIAL_YES};

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
  "Se dispone de información parcial del cumplimiento de las características de diseño del sistema de drenaje", async () => {
  const expected = Boolean(INFORMACION_PARCIAL_NO);
  const last = {value: INFORMACION_PARCIAL_NO};

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
