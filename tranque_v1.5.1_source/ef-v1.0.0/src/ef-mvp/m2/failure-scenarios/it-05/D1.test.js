const utilsIsDefinedMock = (x) => typeof x !== "undefined";

const INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES = + true;  // 1
const INESTABILIDAD_POR_DESLIZAMIENTO_MURO_NO  = + false; // 0

test("script return true when: "+
  "Eventos Grupo D "+
  "a) Evento D1:" +
  "Se deben cumplir todos los eventos en un sector para activar el escenario de falla:" +
  "Eventos Módulo 2:" +
  "• Integridad de los estribos: (Evento B2)" +
  "• Integridad de los estribos: (Evento C1)" +
  "Adicionalmente se cumple al menos uno de los siguientes:" +
  "Eventos Módulo 2:" +
  "• Presencia de filtraciones en el muro del depósito: (Evento C1 o C2)" +
  "• Distancia mínima al muro de la laguna aguas claras: (Evento C1)" +
  "• Presiones de poros: (Evento B5 o superior)", async () => {
  const expected = Boolean(INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES);
  // Condicion1.General
  const eventsIntegridadExternaEstribosC1 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES}];
  const eventsIntegridadExternaEstribosD1 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES}];
  const eventsIntegridadExternaFiltracionesC1 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES}];
  const eventsIntegridadExternaFiltracionesC2 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES}];
  const eventsDistanciaLagunaC1 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES}];
  // Condicion: Presiones de poros: (Evento B5 o superior)
  const eventsPresionPorosB51 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES}];
  const eventsPresionPorosB52 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES}];
  const eventsPresionPorosB53 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES}];
  const eventsPresionPorosB54 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES}];
  const eventsPresionPorosB61 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES}];
  const eventsPresionPorosB62 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES}];
  const eventsPresionPorosB63 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES}];
  const eventsPresionPorosC11 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES}];
  const eventsPresionPorosC12 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES}];
  const eventsPresionPorosC13 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES}];
  const eventsPresionPorosC14 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES}];
  const eventsPresionPorosC15 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES}];
  const eventsPresionPorosC21 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES}];
  const eventsPresionPorosC22 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES}];
  const eventsPresionPorosD1 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES}];
  const eventsPresionPorosD2 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES}];

  const seriesSaveMock = jest.fn();
  const seriesQueryAllMock = async ({head: name}) => ({
    // Condicion1.General
    "*.integridad-externa.estribos.C1": eventsIntegridadExternaEstribosC1,
    "*.integridad-externa.estribos.D1": eventsIntegridadExternaEstribosD1,
    "*.integridad-externa.filtraciones.C1": eventsIntegridadExternaFiltracionesC1,
    "*.integridad-externa.filtraciones.C2": eventsIntegridadExternaFiltracionesC2,
    "*.distancia-laguna.C1": eventsDistanciaLagunaC1,
    // Condicion: Presiones de poros: (Evento B5 o superior)
    "*.B5-1": eventsPresionPorosB51,
    "*.B5-2": eventsPresionPorosB52,
    "*.B5-3": eventsPresionPorosB53,
    "*.B5-4": eventsPresionPorosB54,
    "*.B6-1": eventsPresionPorosB61,
    "*.B6-2": eventsPresionPorosB62,
    "*.B6-3": eventsPresionPorosB63,
    "*.C1-1": eventsPresionPorosC11,
    "*.C1-2": eventsPresionPorosC12,
    "*.C1-3": eventsPresionPorosC13,
    "*.C1-4": eventsPresionPorosC14,
    "*.C1-5": eventsPresionPorosC15,
    "*.C2-1": eventsPresionPorosC21,
    "*.C2-2": eventsPresionPorosC22,
    "*.D1": eventsPresionPorosD1,
    "*.D2": eventsPresionPorosD2
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

test("script false true when: "+
  "Eventos Grupo D "+
  "a) Evento D1:" +
  "Se deben cumplir todos los eventos en un sector para activar el escenario de falla:" +
  "Eventos Módulo 2:" +
  "• Integridad de los estribos: (Evento B2)" +
  "• Integridad de los estribos: (Evento C1)" +
  "Adicionalmente se cumple al menos uno de los siguientes:" +
  "Eventos Módulo 2:" +
  "• Presencia de filtraciones en el muro del depósito: (Evento C1 o C2)" +
  "• Distancia mínima al muro de la laguna aguas claras: (Evento C1)" +
  "• Presiones de poros: (Evento B5 o superior)", async () => {
  const expected = Boolean(INESTABILIDAD_POR_DESLIZAMIENTO_MURO_NO);
  // Condicion1.General
  const eventsIntegridadExternaEstribosC1 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_NO}];
  const eventsIntegridadExternaEstribosD1 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES}];
  const eventsIntegridadExternaFiltracionesC1 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_NO}];
  const eventsIntegridadExternaFiltracionesC2 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_NO}];
  const eventsDistanciaLagunaC1 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_NO}];
  // Condicion: Presiones de poros: (Evento B5 o superior)
  const eventsPresionPorosB51 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_NO}];
  const eventsPresionPorosB52 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_NO}];
  const eventsPresionPorosB53 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_NO}];
  const eventsPresionPorosB54 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_NO}];
  const eventsPresionPorosB61 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_NO}];
  const eventsPresionPorosB62 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_NO}];
  const eventsPresionPorosB63 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_NO}];
  const eventsPresionPorosC11 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_NO}];
  const eventsPresionPorosC12 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_NO}];
  const eventsPresionPorosC13 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_NO}];
  const eventsPresionPorosC14 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_NO}];
  const eventsPresionPorosC15 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_NO}];
  const eventsPresionPorosC21 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_NO}];
  const eventsPresionPorosC22 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_NO}];
  const eventsPresionPorosD1 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_NO}];
  const eventsPresionPorosD2 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_NO}];

  const seriesSaveMock = jest.fn();
  const seriesQueryAllMock = async ({head: name}) => ({
    // Condicion1.General
    "*.integridad-externa.estribos.C1": eventsIntegridadExternaEstribosC1,
    "*.integridad-externa.estribos.D1": eventsIntegridadExternaEstribosD1,
    "*.integridad-externa.filtraciones.C1": eventsIntegridadExternaFiltracionesC1,
    "*.integridad-externa.filtraciones.C2": eventsIntegridadExternaFiltracionesC2,
    "*.distancia-laguna.C1": eventsDistanciaLagunaC1,
    // Condicion: Presiones de poros: (Evento B5 o superior)
    "*.B5-1": eventsPresionPorosB51,
    "*.B5-2": eventsPresionPorosB52,
    "*.B5-3": eventsPresionPorosB53,
    "*.B5-4": eventsPresionPorosB54,
    "*.B6-1": eventsPresionPorosB61,
    "*.B6-2": eventsPresionPorosB62,
    "*.B6-3": eventsPresionPorosB63,
    "*.C1-1": eventsPresionPorosC11,
    "*.C1-2": eventsPresionPorosC12,
    "*.C1-3": eventsPresionPorosC13,
    "*.C1-4": eventsPresionPorosC14,
    "*.C1-5": eventsPresionPorosC15,
    "*.C2-1": eventsPresionPorosC21,
    "*.C2-2": eventsPresionPorosC22,
    "*.D1": eventsPresionPorosD1,
    "*.D2": eventsPresionPorosD2
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

test("script true true when: "+
  "Eventos Grupo D "+
  "a) Evento D1:" +
  "Se deben cumplir todos los eventos en un sector para activar el escenario de falla:" +
  "Eventos Módulo 2:" +
  "• Integridad de los estribos: (Evento B2)" +
  "• Integridad de los estribos: (Evento C1)" +
  "Adicionalmente se cumple al menos uno de los siguientes:" +
  "Eventos Módulo 2:" +
  "• Presencia de filtraciones en el muro del depósito: (Evento C1 o C2)" +
  "• Distancia mínima al muro de la laguna aguas claras: (Evento C1)" +
  "• Presiones de poros: (Evento B5 o superior)", async () => {
  const expected = Boolean(INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES);
  // Condicion1.General
  const eventsIntegridadExternaEstribosC1 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_NO}];
  const eventsIntegridadExternaEstribosD1 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES}];
  const eventsIntegridadExternaFiltracionesC1 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_NO}];
  const eventsIntegridadExternaFiltracionesC2 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES}];
  const eventsDistanciaLagunaC1 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES}];
  // Condicion: Presiones de poros: (Evento B5 o superior)
  const eventsPresionPorosB51 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_NO}];
  const eventsPresionPorosB52 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_NO}];
  const eventsPresionPorosB53 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES}];
  const eventsPresionPorosB54 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_NO}];
  const eventsPresionPorosB61 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_NO}];
  const eventsPresionPorosB62 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_NO}];
  const eventsPresionPorosB63 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES}];
  const eventsPresionPorosC11 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_NO}];
  const eventsPresionPorosC12 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES}];
  const eventsPresionPorosC13 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_NO}];
  const eventsPresionPorosC14 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_NO}];
  const eventsPresionPorosC15 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_NO}];
  const eventsPresionPorosC21 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_NO}];
  const eventsPresionPorosC22 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES}];
  const eventsPresionPorosD1 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES}];
  const eventsPresionPorosD2 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES}];

  const seriesSaveMock = jest.fn();
  const seriesQueryAllMock = async ({head: name}) => ({
    // Condicion1.General
    "*.integridad-externa.estribos.C1": eventsIntegridadExternaEstribosC1,
    "*.integridad-externa.estribos.D1": eventsIntegridadExternaEstribosD1,
    "*.integridad-externa.filtraciones.C1": eventsIntegridadExternaFiltracionesC1,
    "*.integridad-externa.filtraciones.C2": eventsIntegridadExternaFiltracionesC2,
    "*.distancia-laguna.C1": eventsDistanciaLagunaC1,
    // Condicion: Presiones de poros: (Evento B5 o superior)
    "*.B5-1": eventsPresionPorosB51,
    "*.B5-2": eventsPresionPorosB52,
    "*.B5-3": eventsPresionPorosB53,
    "*.B5-4": eventsPresionPorosB54,
    "*.B6-1": eventsPresionPorosB61,
    "*.B6-2": eventsPresionPorosB62,
    "*.B6-3": eventsPresionPorosB63,
    "*.C1-1": eventsPresionPorosC11,
    "*.C1-2": eventsPresionPorosC12,
    "*.C1-3": eventsPresionPorosC13,
    "*.C1-4": eventsPresionPorosC14,
    "*.C1-5": eventsPresionPorosC15,
    "*.C2-1": eventsPresionPorosC21,
    "*.C2-2": eventsPresionPorosC22,
    "*.D1": eventsPresionPorosD1,
    "*.D2": eventsPresionPorosD2
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
