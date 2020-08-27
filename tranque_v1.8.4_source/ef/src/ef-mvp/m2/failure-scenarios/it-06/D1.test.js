const utilsIsDefinedMock = (x) => typeof x !== "undefined";

const INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES = + true;  // 1
const INESTABILIDAD_POR_DESLIZAMIENTO_MURO_NO  = + false; // 0

test("script true when: "+
  "Eventos Grupo D " +
  "a) Evento D1:" +
  "Se deben cumplir todos los eventos en un sector para activar el escenario de falla: " +
  "Eventos Módulo 2:" +
  "• Escenario de falla IT-06: (Evento C1)" +
  "Adicionalmente se cumple al menos uno de los siguientes:" +
  "Eventos Módulo 2:" +
  "• Distancia mínima al muro de la laguna aguas claras: (Evento C1)" +
  "• Presiones de poros: (Evento C1 o superior)" +
  "• Presencia de filtraciones en el muro del depósito: (Evento C1 o C2)", async () => {
  const expected = Boolean(INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES);
  // Condicion: Escenario de falla IT-06: (Evento C1)
  const eventsDeslizamientoMenor = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES}];
  const eventsEvidenciaGrietasC3 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES}];
  // Condicion: Adicionalmente se cumple al menos uno de los siguientes
  const eventsDistanciaLagunaC1 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_NO}];
  // Condicion: Presiones de poros: (Evento C1 o superior)
  const eventsPresionPorosC11 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES}];
  const eventsPresionPorosC12 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_NO}];
  const eventsPresionPorosC13 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES}];
  const eventsPresionPorosC14 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_NO}];
  const eventsPresionPorosC15 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_NO}];
  const eventsPresionPorosC21 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_NO}];
  const eventsPresionPorosC22 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES}];
  const eventsPresionPorosD1 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_NO}];
  const eventsPresionPorosD2 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_NO}];
  // Condicion: Presiones de poros: (Evento C1 o superior)
  const eventsFiltracionesC1 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES}];
  const eventsFiltracionesC2 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_NO}];

  const seriesSaveMock = jest.fn();
  const seriesQueryAllMock = async ({head: name}) => ({
    // Condicion: Escenario de falla IT-06: (Evento C1)
    "*.deslizamiento-menor": eventsDeslizamientoMenor,
    "*.integridad-externa.grietas.C3": eventsEvidenciaGrietasC3,
    // Condicion: Presiones de poros: (Evento B5 o superior)
    "*.C1-1": eventsPresionPorosC11,
    "*.C1-2": eventsPresionPorosC12,
    "*.C1-3": eventsPresionPorosC13,
    "*.C1-4": eventsPresionPorosC14,
    "*.C1-5": eventsPresionPorosC15,
    "*.C2-1": eventsPresionPorosC21,
    "*.C2-2": eventsPresionPorosC22,
    "*.D1": eventsPresionPorosD1,
    "*.D2": eventsPresionPorosD2,
    // Condicion: Presiones de poros: (Evento C1 o superior)
    "*.integridad-externa.filtraciones.C1": eventsFiltracionesC1,
    "*.integridad-externa.filtraciones.C2": eventsFiltracionesC2
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

test("script false when: "+
  "Eventos Grupo D " +
  "a) Evento D1:" +
  "Se deben cumplir todos los eventos en un sector para activar el escenario de falla: " +
  "Eventos Módulo 2:" +
  "• Escenario de falla IT-06: (Evento C1)" +
  "Adicionalmente se cumple al menos uno de los siguientes:" +
  "Eventos Módulo 2:" +
  "• Distancia mínima al muro de la laguna aguas claras: (Evento C1)" +
  "• Presiones de poros: (Evento C1 o superior)" +
  "• Presencia de filtraciones en el muro del depósito: (Evento C1 o C2)", async () => {
  const expected = Boolean(INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES);
  // Condicion: Se deben cumplir todos los eventos en un sector para activar el escenario de falla
  const eventsDeslizamientoMenor = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES}];
  const eventsEvidenciaGrietasC3 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES}];
  // Condicion: Adicionalmente se cumple al menos uno de los siguientes
  const eventsDistanciaLagunaC1 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_NO}];
  // Condicion: Presiones de poros: (Evento C1 o superior)
  const eventsPresionPorosC11 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES}];
  const eventsPresionPorosC12 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_NO}];
  const eventsPresionPorosC13 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES}];
  const eventsPresionPorosC14 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_NO}];
  const eventsPresionPorosC15 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_NO}];
  const eventsPresionPorosC21 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_NO}];
  const eventsPresionPorosC22 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_NO}];
  const eventsPresionPorosD1 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_NO}];
  const eventsPresionPorosD2 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_NO}];
  // Condicion: Presiones de poros: (Evento C1 o superior)
  const eventsFiltracionesC1 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_NO}];
  const eventsFiltracionesC2 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_NO}];

  const seriesSaveMock = jest.fn();
  const seriesQueryAllMock = async ({head: name}) => ({
    // Condicion: Escenario de falla IT-06: (Evento C1)
    "*.deslizamiento-menor": eventsDeslizamientoMenor,
    "*.integridad-externa.grietas.C3": eventsEvidenciaGrietasC3,
    // Condicion: Presiones de poros: (Evento B5 o superior)
    "*.C1-1": eventsPresionPorosC11,
    "*.C1-2": eventsPresionPorosC12,
    "*.C1-3": eventsPresionPorosC13,
    "*.C1-4": eventsPresionPorosC14,
    "*.C1-5": eventsPresionPorosC15,
    "*.C2-1": eventsPresionPorosC21,
    "*.C2-2": eventsPresionPorosC22,
    "*.D1": eventsPresionPorosD1,
    "*.D2": eventsPresionPorosD2,
    // Condicion: Presiones de poros: (Evento C1 o superior)
    "*.integridad-externa.filtraciones.C1": eventsFiltracionesC1,
    "*.integridad-externa.filtraciones.C2": eventsFiltracionesC2
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
