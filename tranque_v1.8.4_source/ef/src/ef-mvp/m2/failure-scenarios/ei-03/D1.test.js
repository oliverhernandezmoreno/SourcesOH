const utilsIsDefinedMock = (x) => typeof x !== "undefined";

const INESTABILIDAD_POR_EROSION_INTERNA_PRODUCTO_APARICION_SUBSIDENCIAS_MURO_YES = + true;  // 1
const INESTABILIDAD_POR_EROSION_INTERNA_PRODUCTO_APARICION_SUBSIDENCIAS_MURO_NO  = + false; // 0

test("script return false when: "+
  "Eventos Grupo D "+
  "a) Protocolo D1: "+
  "Se deben cumplir todos los eventos en un sector para activar el escenario de falla: "+
  "Eventos Módulo 2: "+
  "• Presencia de subsidencia o socavón en el muro o cubeta del depósito: (Evento C1 o C2) "+
  "Adicionalmente se cumple al menos uno de los siguientes: "+
  "Eventos Módulo 2: "+
  "• Distancia mínima al muro de la laguna aguas claras: (Evento B1 o superior) "+
  "• Presión de poros: (Evento B5 o superior) "+
  "• Turbiedad en el sistema de drenaje: (Evento B1, B2 o B3) "+
  "• Presencia de grietas en el muro del depósito: (Evento C1 o C2)", async () => {
  const expected = Boolean(INESTABILIDAD_POR_EROSION_INTERNA_PRODUCTO_APARICION_SUBSIDENCIAS_MURO_NO);
  // Condicion: Se deben cumplir todos los eventos en un sector para activar el escenario de falla
  const eventsSubsidenciaC1 = [{value: INESTABILIDAD_POR_EROSION_INTERNA_PRODUCTO_APARICION_SUBSIDENCIAS_MURO_YES}];
  const eventsSubsidenciaC2 = [{value: INESTABILIDAD_POR_EROSION_INTERNA_PRODUCTO_APARICION_SUBSIDENCIAS_MURO_NO}];
  // Condicion: Adicionalmente se cumple al menos uno de los siguientes
  const eventsDistanciaLagunaB2 = [{value: INESTABILIDAD_POR_EROSION_INTERNA_PRODUCTO_APARICION_SUBSIDENCIAS_MURO_NO}];
  const eventsDistanciaLagunaC1 = [{value: INESTABILIDAD_POR_EROSION_INTERNA_PRODUCTO_APARICION_SUBSIDENCIAS_MURO_NO}];
  // Condicion: Presiones de poros: (Evento C1 o superior)
  const eventsPresionPorosB51 = [{value: INESTABILIDAD_POR_EROSION_INTERNA_PRODUCTO_APARICION_SUBSIDENCIAS_MURO_NO}];
  const eventsPresionPorosB52 = [{value: INESTABILIDAD_POR_EROSION_INTERNA_PRODUCTO_APARICION_SUBSIDENCIAS_MURO_NO}];
  const eventsPresionPorosB53 = [{value: INESTABILIDAD_POR_EROSION_INTERNA_PRODUCTO_APARICION_SUBSIDENCIAS_MURO_NO}];
  const eventsPresionPorosB54 = [{value: INESTABILIDAD_POR_EROSION_INTERNA_PRODUCTO_APARICION_SUBSIDENCIAS_MURO_NO}];
  const eventsPresionPorosB61 = [{value: INESTABILIDAD_POR_EROSION_INTERNA_PRODUCTO_APARICION_SUBSIDENCIAS_MURO_NO}];
  const eventsPresionPorosB62 = [{value: INESTABILIDAD_POR_EROSION_INTERNA_PRODUCTO_APARICION_SUBSIDENCIAS_MURO_NO}];
  const eventsPresionPorosB63 = [{value: INESTABILIDAD_POR_EROSION_INTERNA_PRODUCTO_APARICION_SUBSIDENCIAS_MURO_NO}];
  const eventsPresionPorosC11 = [{value: INESTABILIDAD_POR_EROSION_INTERNA_PRODUCTO_APARICION_SUBSIDENCIAS_MURO_NO}];
  const eventsPresionPorosC12 = [{value: INESTABILIDAD_POR_EROSION_INTERNA_PRODUCTO_APARICION_SUBSIDENCIAS_MURO_NO}];
  const eventsPresionPorosC13 = [{value: INESTABILIDAD_POR_EROSION_INTERNA_PRODUCTO_APARICION_SUBSIDENCIAS_MURO_NO}];
  const eventsPresionPorosC14 = [{value: INESTABILIDAD_POR_EROSION_INTERNA_PRODUCTO_APARICION_SUBSIDENCIAS_MURO_NO}];
  const eventsPresionPorosC15 = [{value: INESTABILIDAD_POR_EROSION_INTERNA_PRODUCTO_APARICION_SUBSIDENCIAS_MURO_NO}];
  const eventsPresionPorosC21 = [{value: INESTABILIDAD_POR_EROSION_INTERNA_PRODUCTO_APARICION_SUBSIDENCIAS_MURO_NO}];
  const eventsPresionPorosC22 = [{value: INESTABILIDAD_POR_EROSION_INTERNA_PRODUCTO_APARICION_SUBSIDENCIAS_MURO_NO}];
  const eventsPresionPorosD1 = [{value: INESTABILIDAD_POR_EROSION_INTERNA_PRODUCTO_APARICION_SUBSIDENCIAS_MURO_NO}];
  const eventsPresionPorosD2 = [{value: INESTABILIDAD_POR_EROSION_INTERNA_PRODUCTO_APARICION_SUBSIDENCIAS_MURO_NO}];
  // Condicion: Turbiedad en el sistema de drenaje: (B3)
  const eventTurbiedadB3 = {value: INESTABILIDAD_POR_EROSION_INTERNA_PRODUCTO_APARICION_SUBSIDENCIAS_MURO_NO};
  // Condicion: Presencia de filtraciones en el muro del depósito: (Evento C1 o C2)
  const eventsGrietasC1 = [{value: INESTABILIDAD_POR_EROSION_INTERNA_PRODUCTO_APARICION_SUBSIDENCIAS_MURO_NO}];
  const eventsGrietasC2 = [{value: INESTABILIDAD_POR_EROSION_INTERNA_PRODUCTO_APARICION_SUBSIDENCIAS_MURO_NO}];

  const seriesSaveMock = jest.fn();
  const seriesQueryAllMock = async ({head: name}) => ({
    // Condicion: Presiones de poros: (Evento C1 o superior)
    "*.integridad-externa.subsidencia.C1": eventsSubsidenciaC1,
    "*.integridad-externa.subsidencia.C2": eventsSubsidenciaC2,
    // Condicion: Distancia mínima al muro de la laguna aguas claras: (Evento B1 o superior)
    "*.distancia-laguna.B2": eventsDistanciaLagunaB2,
    "*.distancia-laguna.C1": eventsDistanciaLagunaC1,
    // Condicion: Distancia mínima al muro de la laguna aguas claras: (Evento B1 o superior)
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
    "*.D2": eventsPresionPorosD2,
    // Condicion: Presencia de filtraciones en el muro del depósito: (Evento C1 o C2)
    "*.integridad-externa.grietas.C1": eventsGrietasC1,
    "*.integridad-externa.grietas.C2": eventsGrietasC2,
    // Condicion: Turbiedad en el sistema de drenaje: (B3)
    "*.turbiedad.B3": eventTurbiedadB3
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

test("script return true when: "+
  "Eventos Grupo D "+
  "a) Protocolo D1: "+
  "Se deben cumplir todos los eventos en un sector para activar el escenario de falla: "+
  "Eventos Módulo 2: "+
  "• Presencia de subsidencia o socavón en el muro o cubeta del depósito: (Evento C1 o C2) "+
  "Adicionalmente se cumple al menos uno de los siguientes: "+
  "Eventos Módulo 2: "+
  "• Distancia mínima al muro de la laguna aguas claras: (Evento B1 o superior) "+
  "• Presión de poros: (Evento B5 o superior) "+
  "• Turbiedad en el sistema de drenaje: (Evento B1, B2 o B3) "+
  "• Presencia de grietas en el muro del depósito: (Evento C1 o C2)", async () => {
  const expected = Boolean(INESTABILIDAD_POR_EROSION_INTERNA_PRODUCTO_APARICION_SUBSIDENCIAS_MURO_YES);
  // Condicion: Se deben cumplir todos los eventos en un sector para activar el escenario de falla
  const eventsSubsidenciaC1 = [{value: INESTABILIDAD_POR_EROSION_INTERNA_PRODUCTO_APARICION_SUBSIDENCIAS_MURO_YES}];
  const eventsSubsidenciaC2 = [{value: INESTABILIDAD_POR_EROSION_INTERNA_PRODUCTO_APARICION_SUBSIDENCIAS_MURO_YES}];
  // Condicion: Adicionalmente se cumple al menos uno de los siguientes
  const eventsDistanciaLagunaB2 = [{value: INESTABILIDAD_POR_EROSION_INTERNA_PRODUCTO_APARICION_SUBSIDENCIAS_MURO_NO}];
  const eventsDistanciaLagunaC1 = [{value: INESTABILIDAD_POR_EROSION_INTERNA_PRODUCTO_APARICION_SUBSIDENCIAS_MURO_NO}];
  // Condicion: Presiones de poros: (Evento C1 o superior)
  const eventsPresionPorosB51 = [{value: INESTABILIDAD_POR_EROSION_INTERNA_PRODUCTO_APARICION_SUBSIDENCIAS_MURO_NO}];
  const eventsPresionPorosB52 = [{value: INESTABILIDAD_POR_EROSION_INTERNA_PRODUCTO_APARICION_SUBSIDENCIAS_MURO_NO}];
  const eventsPresionPorosB53 = [{value: INESTABILIDAD_POR_EROSION_INTERNA_PRODUCTO_APARICION_SUBSIDENCIAS_MURO_NO}];
  const eventsPresionPorosB54 = [{value: INESTABILIDAD_POR_EROSION_INTERNA_PRODUCTO_APARICION_SUBSIDENCIAS_MURO_NO}];
  const eventsPresionPorosB61 = [{value: INESTABILIDAD_POR_EROSION_INTERNA_PRODUCTO_APARICION_SUBSIDENCIAS_MURO_NO}];
  const eventsPresionPorosB62 = [{value: INESTABILIDAD_POR_EROSION_INTERNA_PRODUCTO_APARICION_SUBSIDENCIAS_MURO_NO}];
  const eventsPresionPorosB63 = [{value: INESTABILIDAD_POR_EROSION_INTERNA_PRODUCTO_APARICION_SUBSIDENCIAS_MURO_NO}];
  const eventsPresionPorosC11 = [{value: INESTABILIDAD_POR_EROSION_INTERNA_PRODUCTO_APARICION_SUBSIDENCIAS_MURO_NO}];
  const eventsPresionPorosC12 = [{value: INESTABILIDAD_POR_EROSION_INTERNA_PRODUCTO_APARICION_SUBSIDENCIAS_MURO_NO}];
  const eventsPresionPorosC13 = [{value: INESTABILIDAD_POR_EROSION_INTERNA_PRODUCTO_APARICION_SUBSIDENCIAS_MURO_NO}];
  const eventsPresionPorosC14 = [{value: INESTABILIDAD_POR_EROSION_INTERNA_PRODUCTO_APARICION_SUBSIDENCIAS_MURO_NO}];
  const eventsPresionPorosC15 = [{value: INESTABILIDAD_POR_EROSION_INTERNA_PRODUCTO_APARICION_SUBSIDENCIAS_MURO_NO}];
  const eventsPresionPorosC21 = [{value: INESTABILIDAD_POR_EROSION_INTERNA_PRODUCTO_APARICION_SUBSIDENCIAS_MURO_NO}];
  const eventsPresionPorosC22 = [{value: INESTABILIDAD_POR_EROSION_INTERNA_PRODUCTO_APARICION_SUBSIDENCIAS_MURO_NO}];
  const eventsPresionPorosD1 = [{value: INESTABILIDAD_POR_EROSION_INTERNA_PRODUCTO_APARICION_SUBSIDENCIAS_MURO_NO}];
  const eventsPresionPorosD2 = [{value: INESTABILIDAD_POR_EROSION_INTERNA_PRODUCTO_APARICION_SUBSIDENCIAS_MURO_NO}];
  // Condicion: Turbiedad en el sistema de drenaje: (B3)
  const eventTurbiedadB3 = {value: INESTABILIDAD_POR_EROSION_INTERNA_PRODUCTO_APARICION_SUBSIDENCIAS_MURO_NO};
  // Condicion: Presencia de filtraciones en el muro del depósito: (Evento C1 o C2)
  const eventsGrietasC1 = [{value: INESTABILIDAD_POR_EROSION_INTERNA_PRODUCTO_APARICION_SUBSIDENCIAS_MURO_NO}];
  const eventsGrietasC2 = [{value: INESTABILIDAD_POR_EROSION_INTERNA_PRODUCTO_APARICION_SUBSIDENCIAS_MURO_NO}];

  const seriesSaveMock = jest.fn();
  const seriesQueryAllMock = async ({head: name}) => ({
    // Condicion: Presiones de poros: (Evento C1 o superior)
    "*.integridad-externa.subsidencia.C1": eventsSubsidenciaC1,
    "*.integridad-externa.subsidencia.C2": eventsSubsidenciaC2,
    // Condicion: Distancia mínima al muro de la laguna aguas claras: (Evento B1 o superior)
    "*.distancia-laguna.B2": eventsDistanciaLagunaB2,
    "*.distancia-laguna.C1": eventsDistanciaLagunaC1,
    // Condicion: Distancia mínima al muro de la laguna aguas claras: (Evento B1 o superior)
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
    "*.D2": eventsPresionPorosD2,
    // Condicion: Presencia de filtraciones en el muro del depósito: (Evento C1 o C2)
    "*.integridad-externa.grietas.C1": eventsGrietasC1,
    "*.integridad-externa.grietas.C2": eventsGrietasC2,
    // Condicion: Turbiedad en el sistema de drenaje: (B3)
    "*.turbiedad.B3": eventTurbiedadB3
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
