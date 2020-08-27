const utilsIsDefinedMock = (x) => typeof x !== "undefined";

const COTA_VERTEDERO_YES = + true;  // 1
const COTA_VERTEDERO_NO  = + false; // 0

test("script return true when " +
  "Evento A1: "+
  "Se activa el evento gatillador asociado a que se ha modificado la cota de funcionamiento del vertedero "+
  "de emergencia (Para gestionar este evento se debe actualizar la cota de funcionamiento del vertedero "+
  "de emergencia (dato de configuración del “Potencial de rebalse”))", async () => {
  const expected = Boolean(COTA_VERTEDERO_YES);
  const last = {value: COTA_VERTEDERO_YES};

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
  "Evento A1: "+
  "Se activa el evento gatillador asociado a que se ha modificado la cota de funcionamiento del vertedero "+
  "de emergencia (Para gestionar este evento se debe actualizar la cota de funcionamiento del vertedero "+
  "de emergencia (dato de configuración del “Potencial de rebalse”))", async () => {
  const expected = Boolean(COTA_VERTEDERO_NO);
  const last = {value: COTA_VERTEDERO_NO};

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
