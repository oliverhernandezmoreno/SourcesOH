const utilsIsDefinedMock = (x) => typeof x !== "undefined";

const INESTABILIDAD_POR_AUMENTO_PRESION_POROS_EVIDENCIA_DEFORMACION_YES = + true;  // 1
const INESTABILIDAD_POR_AUMENTO_PRESION_POROS_EVIDENCIA_DEFORMACION_NO  = + false; // 0

test("script return true when: "+
  "Eventos Grupo D: "+
  "a) Evento D1: " +
  "Se deben cumplir todos los eventos en un sector para activar el escenario de falla: " +
  "Eventos Módulo 2:" +
  "• Presiones de poros: (Evento B5 o superior)" +
  "Adicionalmente se cumple al menos uno de los siguientes: " +
  "Eventos Módulo 2: " +
  "• Desplazamiento o deformación del muro: (Evento C1, C2, C3, C4 o C5) " +
  "• Deformación del coronamiento: (Evento C1, C2 o C3)", async () => {
  const expected = Boolean(INESTABILIDAD_POR_AUMENTO_PRESION_POROS_EVIDENCIA_DEFORMACION_YES);
  // Condicion1.General
  const terremoto46 = {value: INESTABILIDAD_POR_AUMENTO_PRESION_POROS_EVIDENCIA_DEFORMACION_YES};
  const terremoto7 = {value: INESTABILIDAD_POR_AUMENTO_PRESION_POROS_EVIDENCIA_DEFORMACION_YES};
  // Condicion: Presiones de poros: (Evento B5 o superior)
  const eventsPresionPorosB51 = [{value: INESTABILIDAD_POR_AUMENTO_PRESION_POROS_EVIDENCIA_DEFORMACION_YES}];
  const eventsPresionPorosB52 = [{value: INESTABILIDAD_POR_AUMENTO_PRESION_POROS_EVIDENCIA_DEFORMACION_YES}];
  const eventsPresionPorosB53 = [{value: INESTABILIDAD_POR_AUMENTO_PRESION_POROS_EVIDENCIA_DEFORMACION_YES}];
  const eventsPresionPorosB54 = [{value: INESTABILIDAD_POR_AUMENTO_PRESION_POROS_EVIDENCIA_DEFORMACION_YES}];
  const eventsPresionPorosB61 = [{value: INESTABILIDAD_POR_AUMENTO_PRESION_POROS_EVIDENCIA_DEFORMACION_YES}];
  const eventsPresionPorosB62 = [{value: INESTABILIDAD_POR_AUMENTO_PRESION_POROS_EVIDENCIA_DEFORMACION_YES}];
  const eventsPresionPorosB63 = [{value: INESTABILIDAD_POR_AUMENTO_PRESION_POROS_EVIDENCIA_DEFORMACION_YES}];
  const eventsPresionPorosC11 = [{value: INESTABILIDAD_POR_AUMENTO_PRESION_POROS_EVIDENCIA_DEFORMACION_YES}];
  const eventsPresionPorosC12 = [{value: INESTABILIDAD_POR_AUMENTO_PRESION_POROS_EVIDENCIA_DEFORMACION_YES}];
  const eventsPresionPorosC13 = [{value: INESTABILIDAD_POR_AUMENTO_PRESION_POROS_EVIDENCIA_DEFORMACION_YES}];
  const eventsPresionPorosC14 = [{value: INESTABILIDAD_POR_AUMENTO_PRESION_POROS_EVIDENCIA_DEFORMACION_YES}];
  const eventsPresionPorosC15 = [{value: INESTABILIDAD_POR_AUMENTO_PRESION_POROS_EVIDENCIA_DEFORMACION_YES}];
  const eventsPresionPorosC21 = [{value: INESTABILIDAD_POR_AUMENTO_PRESION_POROS_EVIDENCIA_DEFORMACION_YES}];
  const eventsPresionPorosC22 = [{value: INESTABILIDAD_POR_AUMENTO_PRESION_POROS_EVIDENCIA_DEFORMACION_YES}];
  const eventsPresionPorosD1 = [{value: INESTABILIDAD_POR_AUMENTO_PRESION_POROS_EVIDENCIA_DEFORMACION_YES}];
  const eventsPresionPorosD2 = [{value: INESTABILIDAD_POR_AUMENTO_PRESION_POROS_EVIDENCIA_DEFORMACION_YES}];
  // Condicion: Desplazamiento o deformación del muro: (Evento C1, C2, C3, C4 o C5)
  const eventsMuroMonolitoEjeXC1 = [{value: INESTABILIDAD_POR_AUMENTO_PRESION_POROS_EVIDENCIA_DEFORMACION_YES}];
  const eventsMuroMonolitoEjeYC2 = [{value: INESTABILIDAD_POR_AUMENTO_PRESION_POROS_EVIDENCIA_DEFORMACION_YES}];
  const eventsMuroMonolitoEjeZC3 = [{value: INESTABILIDAD_POR_AUMENTO_PRESION_POROS_EVIDENCIA_DEFORMACION_YES}];
  const eventsMuroInclinometroEjeXC4 = [{value: INESTABILIDAD_POR_AUMENTO_PRESION_POROS_EVIDENCIA_DEFORMACION_YES}];
  const eventsMuroInclinometroEjeYC5 = [{value: INESTABILIDAD_POR_AUMENTO_PRESION_POROS_EVIDENCIA_DEFORMACION_YES}];
  const eventsMuroInclinometroEjeZC6 = [{value: INESTABILIDAD_POR_AUMENTO_PRESION_POROS_EVIDENCIA_DEFORMACION_YES}];
  // Condicion: Deformación del coronamiento: (Evento C1, C2 o C3)
  const eventsCoronamientoMonolitoEjeXC1 = [{value: INESTABILIDAD_POR_AUMENTO_PRESION_POROS_EVIDENCIA_DEFORMACION_YES}];
  const eventsCoronamientoMonolitoEjeYC2 = [{value: INESTABILIDAD_POR_AUMENTO_PRESION_POROS_EVIDENCIA_DEFORMACION_YES}];
  const eventsCoronamientoMonolitoEjeZC3 = [{value: INESTABILIDAD_POR_AUMENTO_PRESION_POROS_EVIDENCIA_DEFORMACION_YES}];

  const seriesSaveMock = jest.fn();
  const seriesQueryMock = async ({head: name}) => ({
    // Condicion1.General
    "*.terremoto-4-6": terremoto46,
    "*.terremoto-7": terremoto7,
  })[name];
  const seriesQueryAllMock = async ({head: name}) => ({
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
    "*.D2": eventsPresionPorosD2,
    // Condicion: Desplazamiento o deformación del muro: (Evento C1, C2, C3, C4 o C5)
    "*.muro.monolito.eje-x.C1": eventsMuroMonolitoEjeXC1,
    "*.muro.monolito.eje-y.C2": eventsMuroMonolitoEjeYC2,
    "*.muro.monolito.eje-z.C3": eventsMuroMonolitoEjeZC3,
    "*.muro.inclinometro.eje-x.C4": eventsMuroInclinometroEjeXC4,
    "*.muro.inclinometro.eje-y.C5": eventsMuroInclinometroEjeYC5,
    "*.muro.inclinometro.eje-z.C6": eventsMuroInclinometroEjeZC6,
    // Condicion: Deformación del coronamiento: (Evento C1, C2 o C3)
    "*.coronamiento.monolito.eje-x.C1": eventsCoronamientoMonolitoEjeXC1,
    "*.coronamiento.monolito.eje-y.C2": eventsCoronamientoMonolitoEjeYC2,
    "*.coronamiento.monolito.eje-z.C3": eventsCoronamientoMonolitoEjeZC3,
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
      query: seriesQueryMock,
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
  "Eventos Grupo D: "+
  "a) Evento D1: " +
  "Se deben cumplir todos los eventos en un sector para activar el escenario de falla: " +
  "Eventos Módulo 2:" +
  "• Presiones de poros: (Evento B5 o superior)" +
  "Adicionalmente se cumple al menos uno de los siguientes: " +
  "Eventos Módulo 2: " +
  "• Desplazamiento o deformación del muro: (Evento C1, C2, C3, C4 o C5) " +
  "• Deformación del coronamiento: (Evento C1, C2 o C3)", async () => {
  const expected = Boolean(INESTABILIDAD_POR_AUMENTO_PRESION_POROS_EVIDENCIA_DEFORMACION_YES);
  // Condicion1.General
  const terremoto46 = {value: INESTABILIDAD_POR_AUMENTO_PRESION_POROS_EVIDENCIA_DEFORMACION_NO};
  const terremoto7 = {value: INESTABILIDAD_POR_AUMENTO_PRESION_POROS_EVIDENCIA_DEFORMACION_YES};
  // Condicion: Presiones de poros: (Evento B5 o superior)
  const eventsPresionPorosB51 = [{value: INESTABILIDAD_POR_AUMENTO_PRESION_POROS_EVIDENCIA_DEFORMACION_YES}];
  const eventsPresionPorosB52 = [{value: INESTABILIDAD_POR_AUMENTO_PRESION_POROS_EVIDENCIA_DEFORMACION_NO}];
  const eventsPresionPorosB53 = [{value: INESTABILIDAD_POR_AUMENTO_PRESION_POROS_EVIDENCIA_DEFORMACION_NO}];
  const eventsPresionPorosB54 = [{value: INESTABILIDAD_POR_AUMENTO_PRESION_POROS_EVIDENCIA_DEFORMACION_NO}];
  const eventsPresionPorosB61 = [{value: INESTABILIDAD_POR_AUMENTO_PRESION_POROS_EVIDENCIA_DEFORMACION_YES}];
  const eventsPresionPorosB62 = [{value: INESTABILIDAD_POR_AUMENTO_PRESION_POROS_EVIDENCIA_DEFORMACION_NO}];
  const eventsPresionPorosB63 = [{value: INESTABILIDAD_POR_AUMENTO_PRESION_POROS_EVIDENCIA_DEFORMACION_NO}];
  const eventsPresionPorosC11 = [{value: INESTABILIDAD_POR_AUMENTO_PRESION_POROS_EVIDENCIA_DEFORMACION_NO}];
  const eventsPresionPorosC12 = [{value: INESTABILIDAD_POR_AUMENTO_PRESION_POROS_EVIDENCIA_DEFORMACION_NO}];
  const eventsPresionPorosC13 = [{value: INESTABILIDAD_POR_AUMENTO_PRESION_POROS_EVIDENCIA_DEFORMACION_NO}];
  const eventsPresionPorosC14 = [{value: INESTABILIDAD_POR_AUMENTO_PRESION_POROS_EVIDENCIA_DEFORMACION_NO}];
  const eventsPresionPorosC15 = [{value: INESTABILIDAD_POR_AUMENTO_PRESION_POROS_EVIDENCIA_DEFORMACION_NO}];
  const eventsPresionPorosC21 = [{value: INESTABILIDAD_POR_AUMENTO_PRESION_POROS_EVIDENCIA_DEFORMACION_NO}];
  const eventsPresionPorosC22 = [{value: INESTABILIDAD_POR_AUMENTO_PRESION_POROS_EVIDENCIA_DEFORMACION_NO}];
  const eventsPresionPorosD1 = [{value: INESTABILIDAD_POR_AUMENTO_PRESION_POROS_EVIDENCIA_DEFORMACION_NO}];
  const eventsPresionPorosD2 = [{value: INESTABILIDAD_POR_AUMENTO_PRESION_POROS_EVIDENCIA_DEFORMACION_NO}];
  // Condicion: Desplazamiento o deformación del muro: (Evento C1, C2, C3, C4 o C5)
  const eventsMuroMonolitoEjeXC1 = [{value: INESTABILIDAD_POR_AUMENTO_PRESION_POROS_EVIDENCIA_DEFORMACION_NO}];
  const eventsMuroMonolitoEjeYC2 = [{value: INESTABILIDAD_POR_AUMENTO_PRESION_POROS_EVIDENCIA_DEFORMACION_NO}];
  const eventsMuroMonolitoEjeZC3 = [{value: INESTABILIDAD_POR_AUMENTO_PRESION_POROS_EVIDENCIA_DEFORMACION_NO}];
  const eventsMuroInclinometroEjeXC4 = [{value: INESTABILIDAD_POR_AUMENTO_PRESION_POROS_EVIDENCIA_DEFORMACION_YES}];
  const eventsMuroInclinometroEjeYC5 = [{value: INESTABILIDAD_POR_AUMENTO_PRESION_POROS_EVIDENCIA_DEFORMACION_NO}];
  const eventsMuroInclinometroEjeZC6 = [{value: INESTABILIDAD_POR_AUMENTO_PRESION_POROS_EVIDENCIA_DEFORMACION_NO}];
  // Condicion: Deformación del coronamiento: (Evento C1, C2 o C3)
  const eventsCoronamientoMonolitoEjeXC1 = [{value: INESTABILIDAD_POR_AUMENTO_PRESION_POROS_EVIDENCIA_DEFORMACION_NO}];
  const eventsCoronamientoMonolitoEjeYC2 = [{value: INESTABILIDAD_POR_AUMENTO_PRESION_POROS_EVIDENCIA_DEFORMACION_NO}];
  const eventsCoronamientoMonolitoEjeZC3 = [{value: INESTABILIDAD_POR_AUMENTO_PRESION_POROS_EVIDENCIA_DEFORMACION_NO}];

  const seriesSaveMock = jest.fn();
  const seriesQueryMock = async ({head: name}) => ({
    // Condicion1.General
    "*.terremoto-4-6": terremoto46,
    "*.terremoto-7": terremoto7,
  })[name];
  const seriesQueryAllMock = async ({head: name}) => ({
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
    "*.D2": eventsPresionPorosD2,
    // Condicion: Desplazamiento o deformación del muro: (Evento C1, C2, C3, C4 o C5)
    "*.muro.monolito.eje-x.C1": eventsMuroMonolitoEjeXC1,
    "*.muro.monolito.eje-y.C2": eventsMuroMonolitoEjeYC2,
    "*.muro.monolito.eje-z.C3": eventsMuroMonolitoEjeZC3,
    "*.muro.inclinometro.eje-x.C4": eventsMuroInclinometroEjeXC4,
    "*.muro.inclinometro.eje-y.C5": eventsMuroInclinometroEjeYC5,
    "*.muro.inclinometro.eje-z.C6": eventsMuroInclinometroEjeZC6,
    // Condicion: Deformación del coronamiento: (Evento C1, C2 o C3)
    "*.coronamiento.monolito.eje-x.C1": eventsCoronamientoMonolitoEjeXC1,
    "*.coronamiento.monolito.eje-y.C2": eventsCoronamientoMonolitoEjeYC2,
    "*.coronamiento.monolito.eje-z.C3": eventsCoronamientoMonolitoEjeZC3,
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
      query: seriesQueryMock,
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
