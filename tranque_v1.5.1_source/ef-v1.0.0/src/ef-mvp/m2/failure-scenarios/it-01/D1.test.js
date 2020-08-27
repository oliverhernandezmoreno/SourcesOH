const utilsIsDefinedMock = (x) => typeof x !== "undefined";

const INESTABILIDAD_POR_SISMO_EFECTOS_ADVERSOS_YES = + true;  // 1
const INESTABILIDAD_POR_SISMO_EFECTOS_ADVERSOS_NO  = + false; // 0

test("script return true when: "+
  "Eventos Grupo D: " +
  "a) Evento D1: " +
  "Se deben cumplir todos los eventos en un sector para activar el escenario de falla: "+
  "Eventos Módulo 1: " +
  " • Evento gatillador: Sismo sensible (Evento B) " +
  " Eventos Módulo 2: " +
  " • Presiones de poros: (Evento B5 o superior) " +
  " Adicionalmente se cumple al menos uno de los siguientes: " +
  " Eventos Módulo 2: " +
  " • Presencia de grietas en el muro del depósito: (Evento C2) " +
  " • Presencia de filtraciones en el muro del depósito: (Evento C2) " +
  " • Presiones de poros: (Evento B3)", async () => {
  const expected = Boolean(INESTABILIDAD_POR_SISMO_EFECTOS_ADVERSOS_YES);
  // Condicion1.General
  const terremoto46 = {value: INESTABILIDAD_POR_SISMO_EFECTOS_ADVERSOS_YES};
  const terremoto7 = {value: INESTABILIDAD_POR_SISMO_EFECTOS_ADVERSOS_YES};
  // Condicion2.SectoC
  const presionPorosB51 = [{value: INESTABILIDAD_POR_SISMO_EFECTOS_ADVERSOS_YES}];
  const presionPorosB52 = [{value: INESTABILIDAD_POR_SISMO_EFECTOS_ADVERSOS_YES}];
  const presionPorosB53 = [{value: INESTABILIDAD_POR_SISMO_EFECTOS_ADVERSOS_YES}];
  const presionPorosB54 = [{value: INESTABILIDAD_POR_SISMO_EFECTOS_ADVERSOS_YES}];
  const presionPorosB61 = [{value: INESTABILIDAD_POR_SISMO_EFECTOS_ADVERSOS_YES}];
  const presionPorosB62 = [{value: INESTABILIDAD_POR_SISMO_EFECTOS_ADVERSOS_YES}];
  const presionPorosB63 = [{value: INESTABILIDAD_POR_SISMO_EFECTOS_ADVERSOS_YES}];
  const lastPresionPorosC11 = [{value: INESTABILIDAD_POR_SISMO_EFECTOS_ADVERSOS_YES}];
  const lastPresionPorosC12 = [{value: INESTABILIDAD_POR_SISMO_EFECTOS_ADVERSOS_YES}];
  const lastPresionPorosC13 = [{value: INESTABILIDAD_POR_SISMO_EFECTOS_ADVERSOS_YES}];
  const lastPresionPorosC14 = [{value: INESTABILIDAD_POR_SISMO_EFECTOS_ADVERSOS_YES}];
  const lastPresionPorosC15 = [{value: INESTABILIDAD_POR_SISMO_EFECTOS_ADVERSOS_YES}];
  const lastPresionPorosC21 = [{value: INESTABILIDAD_POR_SISMO_EFECTOS_ADVERSOS_YES}];
  const lastPresionPorosC22 = [{value: INESTABILIDAD_POR_SISMO_EFECTOS_ADVERSOS_YES}];
  const lastPresionPorosD1 = [{value: INESTABILIDAD_POR_SISMO_EFECTOS_ADVERSOS_YES}];
  const lastPresionPorosD2 = [{value: INESTABILIDAD_POR_SISMO_EFECTOS_ADVERSOS_YES}];
  // Condicion3.SectoC
  const lastGrietasC2 = [{value: INESTABILIDAD_POR_SISMO_EFECTOS_ADVERSOS_YES}];
  const lastFiltracionesC2 = [{value: INESTABILIDAD_POR_SISMO_EFECTOS_ADVERSOS_YES}];
  const lastPresionPorosB3 = [{value: INESTABILIDAD_POR_SISMO_EFECTOS_ADVERSOS_YES}];

  const seriesSaveMock = jest.fn();
  const seriesQueryMock = async ({head: name}) => ({
    "*.terremoto-4-6": terremoto46,
    "*.terremoto-7": terremoto7,
  })[name];
  const seriesQueryAllMock = async ({head: name}) => ({
    "*.B5-1": presionPorosB51,
    "*.B5-2": presionPorosB52,
    "*.B5-3": presionPorosB53,
    "*.B5-4": presionPorosB54,
    "*.B6-1": presionPorosB61,
    "*.B6-2": presionPorosB62,
    "*.B6-3": presionPorosB63,
    "*.C1-1": lastPresionPorosC11,
    "*.C1-2": lastPresionPorosC12,
    "*.C1-3": lastPresionPorosC13,
    "*.C1-4": lastPresionPorosC14,
    "*.C1-5": lastPresionPorosC15,
    "*.C2-1": lastPresionPorosC21,
    "*.C2-2": lastPresionPorosC22,
    "*.D1": lastPresionPorosD1,
    "*.D2": lastPresionPorosD2,
    "*.integridad-externa.grietas.C2": lastGrietasC2,
    "*.integridad-externa.filtraciones.C2": lastFiltracionesC2,
    "*.B3": lastPresionPorosB3,
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

test("script return false when: "+
  "Eventos Grupo D: " +
  "a) Evento D1: " +
  "Se deben cumplir todos los eventos en un sector para activar el escenario de falla: "+
  "Eventos Módulo 1: " +
  " • Evento gatillador: Sismo sensible (Evento B) " +
  " Eventos Módulo 2: " +
  " • Presiones de poros: (Evento B5 o superior) " +
  " Adicionalmente se cumple al menos uno de los siguientes: " +
  " Eventos Módulo 2: " +
  " • Presencia de grietas en el muro del depósito: (Evento C2) " +
  " • Presencia de filtraciones en el muro del depósito: (Evento C2) " +
  " • Presiones de poros: (Evento B3)", async () => {
  const expected = Boolean(INESTABILIDAD_POR_SISMO_EFECTOS_ADVERSOS_NO);
  // Condicion1.General
  const terremoto46 = {value: INESTABILIDAD_POR_SISMO_EFECTOS_ADVERSOS_NO};
  const terremoto7 = {value: INESTABILIDAD_POR_SISMO_EFECTOS_ADVERSOS_NO};
  // Condicion2.SectoC
  const presionPorosB51 = [{value: INESTABILIDAD_POR_SISMO_EFECTOS_ADVERSOS_NO}];
  const presionPorosB52 = [{value: INESTABILIDAD_POR_SISMO_EFECTOS_ADVERSOS_NO}];
  const presionPorosB53 = [{value: INESTABILIDAD_POR_SISMO_EFECTOS_ADVERSOS_NO}];
  const presionPorosB54 = [{value: INESTABILIDAD_POR_SISMO_EFECTOS_ADVERSOS_NO}];
  const presionPorosB61 = [{value: INESTABILIDAD_POR_SISMO_EFECTOS_ADVERSOS_NO}];
  const presionPorosB62 = [{value: INESTABILIDAD_POR_SISMO_EFECTOS_ADVERSOS_NO}];
  const presionPorosB63 = [{value: INESTABILIDAD_POR_SISMO_EFECTOS_ADVERSOS_NO}];
  const lastPresionPorosC11 = [{value: INESTABILIDAD_POR_SISMO_EFECTOS_ADVERSOS_NO}];
  const lastPresionPorosC12 = [{value: INESTABILIDAD_POR_SISMO_EFECTOS_ADVERSOS_NO}];
  const lastPresionPorosC13 = [{value: INESTABILIDAD_POR_SISMO_EFECTOS_ADVERSOS_NO}];
  const lastPresionPorosC14 = [{value: INESTABILIDAD_POR_SISMO_EFECTOS_ADVERSOS_NO}];
  const lastPresionPorosC15 = [{value: INESTABILIDAD_POR_SISMO_EFECTOS_ADVERSOS_NO}];
  const lastPresionPorosC21 = [{value: INESTABILIDAD_POR_SISMO_EFECTOS_ADVERSOS_NO}];
  const lastPresionPorosC22 = [{value: INESTABILIDAD_POR_SISMO_EFECTOS_ADVERSOS_NO}];
  const lastPresionPorosD1 = [{value: INESTABILIDAD_POR_SISMO_EFECTOS_ADVERSOS_NO}];
  const lastPresionPorosD2 = [{value: INESTABILIDAD_POR_SISMO_EFECTOS_ADVERSOS_NO}];
  // Condicion3.SectoC
  const lastGrietasC2 = [{value: INESTABILIDAD_POR_SISMO_EFECTOS_ADVERSOS_NO}];
  const lastFiltracionesC2 = [{value: INESTABILIDAD_POR_SISMO_EFECTOS_ADVERSOS_NO}];
  const lastPresionPorosB3 = [{value: INESTABILIDAD_POR_SISMO_EFECTOS_ADVERSOS_NO}];

  const seriesSaveMock = jest.fn();
  const seriesQueryMock = async ({head: name}) => ({
    "*.terremoto-4-6": terremoto46,
    "*.terremoto-7": terremoto7,
  })[name];
  const seriesQueryAllMock = async ({head: name}) => ({
    "*.B5-1": presionPorosB51,
    "*.B5-2": presionPorosB52,
    "*.B5-3": presionPorosB53,
    "*.B5-4": presionPorosB54,
    "*.B6-1": presionPorosB61,
    "*.B6-2": presionPorosB62,
    "*.B6-3": presionPorosB63,
    "*.C1-1": lastPresionPorosC11,
    "*.C1-2": lastPresionPorosC12,
    "*.C1-3": lastPresionPorosC13,
    "*.C1-4": lastPresionPorosC14,
    "*.C1-5": lastPresionPorosC15,
    "*.C2-1": lastPresionPorosC21,
    "*.C2-2": lastPresionPorosC22,
    "*.D1": lastPresionPorosD1,
    "*.D2": lastPresionPorosD2,
    "*.integridad-externa.grietas.C2": lastGrietasC2,
    "*.integridad-externa.filtraciones.C2": lastFiltracionesC2,
    "*.B3": lastPresionPorosB3,
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

test("script return false when: "+
  "Eventos Grupo D: " +
  "a) Evento D1: " +
  "Se deben cumplir todos los eventos en un sector para activar el escenario de falla: "+
  "Eventos Módulo 1: " +
  " • Evento gatillador: Sismo sensible (Evento B) " +
  " Eventos Módulo 2: " +
  " • Presiones de poros: (Evento B5 o superior) " +
  " Adicionalmente se cumple al menos uno de los siguientes: " +
  " Eventos Módulo 2: " +
  " • Presencia de grietas en el muro del depósito: (Evento C2) " +
  " • Presencia de filtraciones en el muro del depósito: (Evento C2) " +
  " • Presiones de poros: (Evento B3)", async () => {
  const expected = Boolean(INESTABILIDAD_POR_SISMO_EFECTOS_ADVERSOS_NO);
  // Condicion1.General
  const terremoto46 = {value: INESTABILIDAD_POR_SISMO_EFECTOS_ADVERSOS_NO};
  const terremoto7 = {value: INESTABILIDAD_POR_SISMO_EFECTOS_ADVERSOS_YES};
  // Condicion2.SectoC
  const presionPorosB51 = [{value: INESTABILIDAD_POR_SISMO_EFECTOS_ADVERSOS_YES}];
  const presionPorosB52 = [{value: INESTABILIDAD_POR_SISMO_EFECTOS_ADVERSOS_NO}];
  const presionPorosB53 = [{value: INESTABILIDAD_POR_SISMO_EFECTOS_ADVERSOS_NO}];
  const presionPorosB54 = [{value: INESTABILIDAD_POR_SISMO_EFECTOS_ADVERSOS_NO}];
  const presionPorosB61 = [{value: INESTABILIDAD_POR_SISMO_EFECTOS_ADVERSOS_YES}];
  const presionPorosB62 = [{value: INESTABILIDAD_POR_SISMO_EFECTOS_ADVERSOS_NO}];
  const presionPorosB63 = [{value: INESTABILIDAD_POR_SISMO_EFECTOS_ADVERSOS_NO}];
  const lastPresionPorosC11 = [{value: INESTABILIDAD_POR_SISMO_EFECTOS_ADVERSOS_YES}];
  const lastPresionPorosC12 = [{value: INESTABILIDAD_POR_SISMO_EFECTOS_ADVERSOS_NO}];
  const lastPresionPorosC13 = [{value: INESTABILIDAD_POR_SISMO_EFECTOS_ADVERSOS_NO}];
  const lastPresionPorosC14 = [{value: INESTABILIDAD_POR_SISMO_EFECTOS_ADVERSOS_NO}];
  const lastPresionPorosC15 = [{value: INESTABILIDAD_POR_SISMO_EFECTOS_ADVERSOS_NO}];
  const lastPresionPorosC21 = [{value: INESTABILIDAD_POR_SISMO_EFECTOS_ADVERSOS_NO}];
  const lastPresionPorosC22 = [{value: INESTABILIDAD_POR_SISMO_EFECTOS_ADVERSOS_NO}];
  const lastPresionPorosD1 = [{value: INESTABILIDAD_POR_SISMO_EFECTOS_ADVERSOS_NO}];
  const lastPresionPorosD2 = [{value: INESTABILIDAD_POR_SISMO_EFECTOS_ADVERSOS_NO}];
  // Condicion3.SectoC
  const lastGrietasC2 = [{value: INESTABILIDAD_POR_SISMO_EFECTOS_ADVERSOS_NO}];
  const lastFiltracionesC2 = [{value: INESTABILIDAD_POR_SISMO_EFECTOS_ADVERSOS_NO}];
  const lastPresionPorosB3 = [{value: INESTABILIDAD_POR_SISMO_EFECTOS_ADVERSOS_NO}];

  const seriesSaveMock = jest.fn();
  const seriesQueryMock = async ({head: name}) => ({
    "*.terremoto-4-6": terremoto46,
    "*.terremoto-7": terremoto7,
  })[name];
  const seriesQueryAllMock = async ({head: name}) => ({
    "*.B5-1": presionPorosB51,
    "*.B5-2": presionPorosB52,
    "*.B5-3": presionPorosB53,
    "*.B5-4": presionPorosB54,
    "*.B6-1": presionPorosB61,
    "*.B6-2": presionPorosB62,
    "*.B6-3": presionPorosB63,
    "*.C1-1": lastPresionPorosC11,
    "*.C1-2": lastPresionPorosC12,
    "*.C1-3": lastPresionPorosC13,
    "*.C1-4": lastPresionPorosC14,
    "*.C1-5": lastPresionPorosC15,
    "*.C2-1": lastPresionPorosC21,
    "*.C2-2": lastPresionPorosC22,
    "*.D1": lastPresionPorosD1,
    "*.D2": lastPresionPorosD2,
    "*.integridad-externa.grietas.C2": lastGrietasC2,
    "*.integridad-externa.filtraciones.C2": lastFiltracionesC2,
    "*.B3": lastPresionPorosB3,
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
