const utilsIsDefinedMock = (x) => typeof x !== "undefined";

const VERTEDERO_YES = + true;  // 1
const VERTEDERO_NO = + false;  // 0
const VERTEDERO_NO_OPERATIVO_YES = + true;  // 1
const VERTEDERO_NO_OPERATIVO_NO = + false;  // 0
const FORECAST_LLUVIA_YES  = + true; // 1
const ESTADO_LLUVIA_YES  = + true; // 1

test("script return true when " +
  "Evento B1: "+
  "Se activa el evento gatillador asociado a que el vertedero de emergencia no está operativo.Está activo el Evento A1." +
  "Está activo el evento gatillador “Lluvia en desarrollo” o “Pronóstico de lluvia”", async () => {
  const expected = Boolean(VERTEDERO_YES);
  const vertedero_no_operativo = {value: VERTEDERO_NO_OPERATIVO_YES};
  const forecast_lluvia = {value: FORECAST_LLUVIA_YES};
  const estado_lluvia = {value: ESTADO_LLUVIA_YES};

  const seriesSaveMock = jest.fn();
  const seriesQueryMock = async ({head: name}) => ({
    "*.vertedero-no-operativo": vertedero_no_operativo,
    "*.forecasts.lluvia": forecast_lluvia,
    "*.estado-lluvia": estado_lluvia,
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
    .toEqual(expected);
});

test("script return true when " +
  "Evento B1: "+
  "Se activa el evento gatillador asociado a que el vertedero de emergencia no está operativo.Está activo el Evento A1." +
  "Está activo el evento gatillador “Lluvia en desarrollo” o “Pronóstico de lluvia”", async () => {
  const expected = Boolean(VERTEDERO_NO);
  const vertedero_no_operativo = {value: VERTEDERO_NO_OPERATIVO_NO};
  const forecast_lluvia = {value: FORECAST_LLUVIA_YES};
  const estado_lluvia = {value: ESTADO_LLUVIA_YES};

  const seriesSaveMock = jest.fn();
  const seriesQueryMock = async ({head: name}) => ({
    "*.vertedero-no-operativo": vertedero_no_operativo,
    "*.forecasts.lluvia": forecast_lluvia,
    "*.estado-lluvia": estado_lluvia,
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
    .toEqual(expected);
});
