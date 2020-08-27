const utilsIsDefinedMock = (x) => typeof x !== "undefined";

const DETECTA_B2_YES = + true;  // 1
const DETECTA_B2_NO  = + false; // 0

test("script return true when " +
  "Evento B2: (Se informa por sector) "+
  "Ingeniero especialista (por ejemplo, EoR) detecta que las propiedades resistentes o el módulo de " +
  "deformación no son acorde con lo especificado en el diseño (se determina a partir del informe de la " +
  "empresa a cargo del estudio).", async () => {
  const expected = Boolean(DETECTA_B2_YES);
  const last = {value: DETECTA_B2_YES};

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
  "Evento B1: (Se informa por sector) "+
  "Ingeniero especialista (por ejemplo, EoR) detecta que las propiedades resistentes o el módulo de " +
  "deformación no son acorde con lo especificado en el diseño (se determina a partir del informe de la " +
  "empresa a cargo del estudio).", async () => {
  const expected = Boolean(DETECTA_B2_NO);
  const last = {value: DETECTA_B2_NO};

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
