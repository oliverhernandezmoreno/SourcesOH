const utilsIsDefinedMock = (x) => typeof x !== "undefined";

const REBALSE_RELAVES_PRODUCTO_LICUEFACCION_CUBETA_YES = + true;  // 1
const REBALSE_RELAVES_PRODUCTO_LICUEFACCION_CUBETA_NO  = + false; // 0

test("script return true when: "+
  "Evento C1: "+
  "Se deben cumplir todos los eventos en un sector para activar el escenario de falla:" +
  "Eventos Módulo 2: "+
  "• Revancha operacional: Evento A2" +
  "• Pendiente de playa: Evento B1" +
  "• Nivel freático en la cubeta: Evento B1", async () => {
  const expected = Boolean(REBALSE_RELAVES_PRODUCTO_LICUEFACCION_CUBETA_YES);
  const lastRevanchaOperacionalA2 = [{value: REBALSE_RELAVES_PRODUCTO_LICUEFACCION_CUBETA_YES}];
  const lastPendientePlayaB1 = [{value: REBALSE_RELAVES_PRODUCTO_LICUEFACCION_CUBETA_YES}];
  const lastNivelFreaticoCubetaDepositoB1 = [{value: REBALSE_RELAVES_PRODUCTO_LICUEFACCION_CUBETA_YES}];

  const seriesSaveMock = jest.fn();
  const seriesQueryAllMock = async ({head: name}) => ({
    "*.revancha-operacional.A2": lastRevanchaOperacionalA2,
    "*.pendiente-playa.B1": lastPendientePlayaB1,
    "*.nivel-freatico-cubeta-deposito.B1": lastNivelFreaticoCubetaDepositoB1,
  })[name];
  const debug = (msg) => console.log("DEBUG:", msg);

  await script({
    series: {
      queryAll: seriesQueryAllMock,
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
  "Evento C1: "+
  "Se deben cumplir todos los eventos en un sector para activar el escenario de falla:" +
  "Eventos Módulo 2: "+
  "• Revancha operacional: Evento A2" +
  "• Pendiente de playa: Evento B1" +
  "• Nivel freático en la cubeta: Evento B1", async () => {
  const expected = Boolean(REBALSE_RELAVES_PRODUCTO_LICUEFACCION_CUBETA_NO);
  const lastRevanchaOperacionalA2 = [{value: REBALSE_RELAVES_PRODUCTO_LICUEFACCION_CUBETA_NO}];
  const lastPendientePlayaB1 = [{value: REBALSE_RELAVES_PRODUCTO_LICUEFACCION_CUBETA_YES}];
  const lastNivelFreaticoCubetaDepositoB1 = [{value: REBALSE_RELAVES_PRODUCTO_LICUEFACCION_CUBETA_YES}];

  const seriesSaveMock = jest.fn();
  const seriesQueryAllMock = async ({head: name}) => ({
    "*.ef-mvp.m2.parameters.revancha-operacional.A2": lastRevanchaOperacionalA2,
    "*.pendiente-playa.B1": lastPendientePlayaB1,
    "*.nivel-freatico-cubeta-deposito.B1": lastNivelFreaticoCubetaDepositoB1,
  })[name];
  const debug = (msg) => console.log("DEBUG:", msg);

  await script({
    series: {
      queryAll: seriesQueryAllMock,
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
  "Evento C1: "+
  "Se deben cumplir todos los eventos en un sector para activar el escenario de falla:" +
  "Eventos Módulo 2: "+
  "• Revancha operacional: Evento A2" +
  "• Pendiente de playa: Evento B1" +
  "• Nivel freático en la cubeta: Evento B1", async () => {
  const expected = Boolean(REBALSE_RELAVES_PRODUCTO_LICUEFACCION_CUBETA_NO);
  const lastRevanchaOperacionalA2 = [{value: REBALSE_RELAVES_PRODUCTO_LICUEFACCION_CUBETA_YES}];
  const lastPendientePlayaB1 = [{value: REBALSE_RELAVES_PRODUCTO_LICUEFACCION_CUBETA_NO}];
  const lastNivelFreaticoCubetaDepositoB1 = [{value: REBALSE_RELAVES_PRODUCTO_LICUEFACCION_CUBETA_YES}];

  const seriesSaveMock = jest.fn();
  const seriesQueryAllMock = async ({head: name}) => ({
    "*.ef-mvp.m2.parameters.revancha-operacional.A2": lastRevanchaOperacionalA2,
    "*.pendiente-playa.B1": lastPendientePlayaB1,
    "*.nivel-freatico-cubeta-deposito.B1": lastNivelFreaticoCubetaDepositoB1,
  })[name];
  const debug = (msg) => console.log("DEBUG:", msg);

  await script({
    series: {
      queryAll: seriesQueryAllMock,
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
  "Evento C1: "+
  "Se deben cumplir todos los eventos en un sector para activar el escenario de falla:" +
  "Eventos Módulo 2: "+
  "• Revancha operacional: Evento A2" +
  "• Pendiente de playa: Evento B1" +
  "• Nivel freático en la cubeta: Evento B1", async () => {
  const expected = Boolean(REBALSE_RELAVES_PRODUCTO_LICUEFACCION_CUBETA_NO);
  const lastRevanchaOperacionalA2 = [{value: REBALSE_RELAVES_PRODUCTO_LICUEFACCION_CUBETA_YES}];
  const lastPendientePlayaB1 = [{value: REBALSE_RELAVES_PRODUCTO_LICUEFACCION_CUBETA_YES}];
  const lastNivelFreaticoCubetaDepositoB1 = [{value: REBALSE_RELAVES_PRODUCTO_LICUEFACCION_CUBETA_NO}];

  const seriesSaveMock = jest.fn();
  const seriesQueryAllMock = async ({head: name}) => ({
    "*.ef-mvp.m2.parameters.revancha-operacional.A2": lastRevanchaOperacionalA2,
    "*.pendiente-playa.B1": lastPendientePlayaB1,
    "*.nivel-freatico-cubeta-deposito.B1": lastNivelFreaticoCubetaDepositoB1,
  })[name];
  const debug = (msg) => console.log("DEBUG:", msg);

  await script({
    series: {
      queryAll: seriesQueryAllMock,
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
