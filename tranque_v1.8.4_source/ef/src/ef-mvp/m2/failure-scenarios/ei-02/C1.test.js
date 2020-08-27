const utilsIsDefinedMock = (x) => typeof x !== "undefined";

const EROSION_INTERNA_PRODUCTO_SUBSIDENCIAS_CUBETA_MURO_YES = + true;  // 1
const EROSION_INTERNA_PRODUCTO_SUBSIDENCIAS_CUBETA_MURO_NO  = + false; // 0

test("script return true when: "+
  "Eventos Grupo D "+
  "a) Evento D1: (Por confirmación manual)" +
  "Se deben cumplir todos los eventos en un sector para activar el escenario de falla:" +
  "Eventos Módulo 2:"+
  "• Escenario de falla EI-02: Evento C1", async () => {
  const expected = Boolean(EROSION_INTERNA_PRODUCTO_SUBSIDENCIAS_CUBETA_MURO_YES);
  // Condicion: Escenario de falla EI-02: Evento C1
  const eventsIntegridadExternaSubsidenciaB2 = [{value: EROSION_INTERNA_PRODUCTO_SUBSIDENCIAS_CUBETA_MURO_YES}];
  const eventsDistanciaLagunaB2 = [{value: EROSION_INTERNA_PRODUCTO_SUBSIDENCIAS_CUBETA_MURO_YES}];
  const eventsDistanciaLagunaC1 = [{value: EROSION_INTERNA_PRODUCTO_SUBSIDENCIAS_CUBETA_MURO_NO}];

  const seriesSaveMock = jest.fn();
  const seriesQueryAllMock = async ({head: name}) => ({
    // Condicion: Escenario de falla EI-02: Evento C1
    "*.integridad-externa.subsidencia.B2": eventsIntegridadExternaSubsidenciaB2,
    "*.distancia-laguna.B2": eventsDistanciaLagunaB2,
    "*.distancia-laguna.C1": eventsDistanciaLagunaC1
  })[name];
  const assertMock = (x) => {
    if (typeof x === "undefined" || x === null) {
      throw new Error("assert!");
    }
    return x;
  }
  const debug = (msg) => console.log("DEBUG:", msg);

  await script({
    series: {
      queryAll: seriesQueryAllMock,
      yield: seriesSaveMock,
    },
    utils: {
      isDefined: utilsIsDefinedMock,
      debug: debug,
      assert: assertMock,
    },
  });

  // assert
  expect(seriesSaveMock.mock.calls.length)
    .toEqual(1);
  expect(seriesSaveMock.mock.calls[0][0])
    .toEqual(expected);
});

test("script return false when: "+
  "Eventos Grupo D "+
  "a) Evento D1: (Por confirmación manual)" +
  "Se deben cumplir todos los eventos en un sector para activar el escenario de falla:" +
  "Eventos Módulo 2:"+
  "• Escenario de falla EI-02: Evento C1", async () => {
  const expected = Boolean(EROSION_INTERNA_PRODUCTO_SUBSIDENCIAS_CUBETA_MURO_NO);
  // Condicion: Escenario de falla EI-02: Evento C1
  const eventsIntegridadExternaSubsidenciaB2 = [{value: EROSION_INTERNA_PRODUCTO_SUBSIDENCIAS_CUBETA_MURO_YES}];
  const eventsDistanciaLagunaB2 = [{value: EROSION_INTERNA_PRODUCTO_SUBSIDENCIAS_CUBETA_MURO_NO}];
  const eventsDistanciaLagunaC1 = [{value: EROSION_INTERNA_PRODUCTO_SUBSIDENCIAS_CUBETA_MURO_NO}];

  const seriesSaveMock = jest.fn();
  const seriesQueryAllMock = async ({head: name}) => ({
    // Condicion: Escenario de falla EI-02: Evento C1
    "*.integridad-externa.subsidencia.B2": eventsIntegridadExternaSubsidenciaB2,
    "*.distancia-laguna.B2": eventsDistanciaLagunaB2,
    "*.distancia-laguna.C1": eventsDistanciaLagunaC1
  })[name];
  const assertMock = (x) => {
    if (typeof x === "undefined" || x === null) {
      throw new Error("assert!");
    }
    return x;
  }
  const debug = (msg) => console.log("DEBUG:", msg);

  await script({
    series: {
      queryAll: seriesQueryAllMock,
      yield: seriesSaveMock,
    },
    utils: {
      isDefined: utilsIsDefinedMock,
      debug: debug,
      assert: assertMock,
    },
  });

  // assert
  expect(seriesSaveMock.mock.calls.length)
    .toEqual(1);
  expect(seriesSaveMock.mock.calls[0][0])
    .toEqual(expected);
});
