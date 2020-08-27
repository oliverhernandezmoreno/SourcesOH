const utilsIsDefinedMock = (x) => typeof x !== "undefined";

const REBALSE_RELAVES_PRODUCTO_LICUEFACCION_CUBETA_YES = + true;  // 1
const REBALSE_RELAVES_PRODUCTO_LICUEFACCION_CUBETA_NO  = + false; // 0

test("script return true when: "+
  "Evento D1: (Por confirmación manual)" +
  "Se deben cumplir todos los eventos en un sector para activar el escenario de falla:"+
  "Eventos Módulo 2:"+
  "• Escenario de falla Re-03: Evento C1", async () => {
  const expected = Boolean(REBALSE_RELAVES_PRODUCTO_LICUEFACCION_CUBETA_YES);
  const lastConfirmacionManualD1 = {value: REBALSE_RELAVES_PRODUCTO_LICUEFACCION_CUBETA_YES};
  const lastRe03C1 = {value: REBALSE_RELAVES_PRODUCTO_LICUEFACCION_CUBETA_YES};

  const seriesSaveMock = jest.fn();
  const seriesQueryMock = async ({head: name}) => ({
    "*.confirmacion-manual-D1": lastConfirmacionManualD1,
    "*.re-03.C1": lastRe03C1
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

test("script return false when: "+
  "Evento D1: (Por confirmación manual)" +
  "Se deben cumplir todos los eventos en un sector para activar el escenario de falla:"+
  "Eventos Módulo 2:"+
  "• Escenario de falla Re-03: Evento C1", async () => {
  const expected = Boolean(REBALSE_RELAVES_PRODUCTO_LICUEFACCION_CUBETA_NO);
  const lastConfirmacionManualD1 = {value: REBALSE_RELAVES_PRODUCTO_LICUEFACCION_CUBETA_NO};
  const lastRe03C1 = {value: REBALSE_RELAVES_PRODUCTO_LICUEFACCION_CUBETA_YES};

  const seriesSaveMock = jest.fn();
  const seriesQueryMock = async ({head: name}) => ({
    "*.confirmacion-manual-D1": lastConfirmacionManualD1,
    "*.re-03.C1": lastRe03C1
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

test("script return false when: "+
  "Evento D1: (Por confirmación manual)" +
  "Se deben cumplir todos los eventos en un sector para activar el escenario de falla:"+
  "Eventos Módulo 2:"+
  "• Escenario de falla Re-03: Evento C1", async () => {
  const expected = Boolean(REBALSE_RELAVES_PRODUCTO_LICUEFACCION_CUBETA_NO);
  const lastConfirmacionManualD1 = {value: REBALSE_RELAVES_PRODUCTO_LICUEFACCION_CUBETA_YES};
  const lastRe03C1 = {value: REBALSE_RELAVES_PRODUCTO_LICUEFACCION_CUBETA_NO};

  const seriesSaveMock = jest.fn();
  const seriesQueryMock = async ({head: name}) => ({
    "*.confirmacion-manual-D1": lastConfirmacionManualD1,
    "*.re-03.C1": lastRe03C1
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
