const utilsIsDefinedMock = (x) => typeof x !== "undefined";

const DETECTA_C2_YES = + true;  // 1
const DETECTA_C2_NO  = + false; // 0

test("script return true when " +
  "Evento C2: (Se informa por sector) "+
  "Ingeniero especialista (por ejemplo, EoR) detecta que las propiedades resistentes o el módulo de " +
  "deformación no son acorde con lo especificado en el diseño (se determina a partir del informe de la " +
  "empresa a cargo del estudio).", async () => {
  const expected = Boolean(DETECTA_C2_NO);
  const events = [{value: DETECTA_C2_NO}];

  const seriesSaveMock = jest.fn();
  const seriesQueryAllMock = async () => events;

  const debug = (msg) => console.log("DEBUG:", msg);

  await script({
    series: {
      yield: seriesSaveMock,
      queryAll: seriesQueryAllMock,
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
  "Evento C2: (Se informa por sector) "+
  "Ingeniero especialista (por ejemplo, EoR) detecta que las propiedades resistentes o el módulo de " +
  "deformación no son acorde con lo especificado en el diseño (se determina a partir del informe de la " +
  "empresa a cargo del estudio).", async () => {
  const expected = Boolean(DETECTA_C2_YES);
  const events = [{value: DETECTA_C2_YES}];

  const seriesSaveMock = jest.fn();
  const seriesQueryAllMock = async () => events;

  const debug = (msg) => console.log("DEBUG:", msg);

  await script({
    series: {
      yield: seriesSaveMock,
      queryAll: seriesQueryAllMock
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
