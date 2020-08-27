const utilsIsDefinedMock = (x) => typeof x !== "undefined";

const PROPIEDADES_RESISTENTES_YES = + true;  // 1
const PROPIEDADES_RESISTENTES_NO  = + false; // 0

test("script return true when " +
  "Evento B1: (Se informa por sector) " +
  "Si se detecta que las propiedades resistentes de la cubeta no cumplen con las especificadas en diseño " +
  "(Se determina a partir del informe de la empresa a cargo del estudio).", async () => {
  const expected = Boolean(PROPIEDADES_RESISTENTES_YES);
  const last = {value: PROPIEDADES_RESISTENTES_YES};

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

test("script return true when " +
  "Evento B1: (Se informa por sector) " +
  "Si se detecta que las propiedades resistentes de la cubeta no cumplen con las especificadas en diseño " +
  "(Se determina a partir del informe de la empresa a cargo del estudio).", async () => {
  const expected = Boolean(PROPIEDADES_RESISTENTES_NO);
  const last = {value: PROPIEDADES_RESISTENTES_NO};

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
