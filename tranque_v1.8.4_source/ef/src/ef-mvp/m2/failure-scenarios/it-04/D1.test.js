const utilsIsDefinedMock = (x) => typeof x !== "undefined";

const INESTABILIDAD_POR_LICUACION_ESTATICA_YES = + true;  // 1
const INESTABILIDAD_POR_LICUACION_ESTATICA_NO  = + false; // 0

test("script return true when: "+
  "Se deben cumplir todos los eventos en un sector para activar el escenario de falla: "+
  "Eventos Módulo 1:" +
  "• Evento gatillador: Sismo sensible (Evento B)" +
  "Eventos Módulo 2:" +
  "• Módulo de rigidez y resistencia al corte del muro: (Evento C2)"+
  "• Presiones de poro: (Evento B5 o superior)", async () => {
  const expected = Boolean(INESTABILIDAD_POR_LICUACION_ESTATICA_YES);
  // Condicion: Evento gatillador: Sismo sensible (Evento B)
  const terremoto46 = {value: INESTABILIDAD_POR_LICUACION_ESTATICA_YES};
  const terremoto7 = {value: INESTABILIDAD_POR_LICUACION_ESTATICA_YES};
  // Condicion: Módulo de rigidez y resistencia al corte del muro: (Evento C2)
  const eventsModulosDeformacionResistenciaMuroC2 = [{value: INESTABILIDAD_POR_LICUACION_ESTATICA_YES}];
  // Condicion: Presiones de poro: (Evento B5 o superior)
  const eventsPresionPorosB51 = [{value: INESTABILIDAD_POR_LICUACION_ESTATICA_YES}];
  const eventsPresionPorosB52 = [{value: INESTABILIDAD_POR_LICUACION_ESTATICA_YES}];
  const eventsPresionPorosB53 = [{value: INESTABILIDAD_POR_LICUACION_ESTATICA_YES}];
  const eventsPresionPorosB54 = [{value: INESTABILIDAD_POR_LICUACION_ESTATICA_YES}];
  const eventsPresionPorosB61 = [{value: INESTABILIDAD_POR_LICUACION_ESTATICA_YES}];
  const eventsPresionPorosB62 = [{value: INESTABILIDAD_POR_LICUACION_ESTATICA_YES}];
  const eventsPresionPorosB63 = [{value: INESTABILIDAD_POR_LICUACION_ESTATICA_YES}];
  const eventsPresionPorosC11 = [{value: INESTABILIDAD_POR_LICUACION_ESTATICA_YES}];
  const eventsPresionPorosC12 = [{value: INESTABILIDAD_POR_LICUACION_ESTATICA_YES}];
  const eventsPresionPorosC13 = [{value: INESTABILIDAD_POR_LICUACION_ESTATICA_YES}];
  const eventsPresionPorosC14 = [{value: INESTABILIDAD_POR_LICUACION_ESTATICA_YES}];
  const eventsPresionPorosC15 = [{value: INESTABILIDAD_POR_LICUACION_ESTATICA_YES}];
  const eventsPresionPorosC21 = [{value: INESTABILIDAD_POR_LICUACION_ESTATICA_YES}];
  const eventsPresionPorosC22 = [{value: INESTABILIDAD_POR_LICUACION_ESTATICA_YES}];
  const eventsPresionPorosD1 = [{value: INESTABILIDAD_POR_LICUACION_ESTATICA_YES}];
  const eventsPresionPorosD2 = [{value: INESTABILIDAD_POR_LICUACION_ESTATICA_YES}];

  const seriesSaveMock = jest.fn();
  const seriesQueryMock = async ({head: name}) => ({
    // Condicion: Evento gatillador: Sismo sensible (Evento B)
    "*.terremoto-4-6": terremoto46,
    "*.terremoto-7": terremoto7,
    // Condicion: Condicion: Módulo de rigidez y resistencia al corte del muro: (Evento C2)
    "*.modulos-deformacion-resistencia-muro.C2": eventsModulosDeformacionResistenciaMuroC2
  })[name];
  const seriesQueryAllMock = async ({head: name}) => ({
    // Condicion: Condicion: Módulo de rigidez y resistencia al corte del muro: (Evento C2)
    "*.modulos-deformacion-resistencia-muro.C2": eventsModulosDeformacionResistenciaMuroC2,
    // Condicion: Presiones de poro: (Evento B5 o superior)
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
  const refsGetManyMock = async (eventsModulosDeformacionResistenciaMuroC2) => ({
    // Condicion: Módulo de rigidez y resistencia al corte del muro: (Evento C2)
    "*.modulos-deformacion-resistencia-muro.C2": eventsModulosDeformacionResistenciaMuroC2
  })[eventsModulosDeformacionResistenciaMuroC2];
  const refsExpandMock = async (eventsModulosDeformacionResistenciaMuroC2) => ({
    // Condicion: Módulo de rigidez y resistencia al corte del muro: (Evento C2)
    "*.modulos-deformacion-resistencia-muro.C2": eventsModulosDeformacionResistenciaMuroC2
  })[eventsModulosDeformacionResistenciaMuroC2];
  const refsGetOneMock = async (eventsModulosDeformacionResistenciaMuroC2) => ({
    // Condicion: Módulo de rigidez y resistencia al corte del muro: (Evento C2)
    "*.modulos-deformacion-resistencia-muro.C2": eventsModulosDeformacionResistenciaMuroC2
  })[eventsModulosDeformacionResistenciaMuroC2];
  const refsMatchMock = async (eventsModulosDeformacionResistenciaMuroC2) => ({
    // Condicion: Módulo de rigidez y resistencia al corte del muro: (Evento C2)
    "*.modulos-deformacion-resistencia-muro.C2": eventsModulosDeformacionResistenciaMuroC2
  })[eventsModulosDeformacionResistenciaMuroC2];
  const assertMock = (x) => {
    if (typeof x === "undefined" || x === null) {
      throw new Error("assert!");
    }
    return x;
  }
  const debug = (msg) => console.log("DEBUG:", msg);

  await script({
    refs: {
      getMany: refsGetManyMock,
      expand: refsExpandMock,
      getOne: refsGetOneMock,
      match: refsMatchMock,
    },
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

test("script false true when: "+
  "Se deben cumplir todos los eventos en un sector para activar el escenario de falla: "+
  "Eventos Módulo 1:" +
  "• Evento gatillador: Sismo sensible (Evento B)" +
  "Eventos Módulo 2:" +
  "• Módulo de rigidez y resistencia al corte del muro: (Evento C2)"+
  "• Presiones de poro: (Evento B5 o superior)", async () => {
  const expected = Boolean(INESTABILIDAD_POR_LICUACION_ESTATICA_YES);
  // Condicion1.General
  const terremoto46 = {value: INESTABILIDAD_POR_LICUACION_ESTATICA_NO};
  const terremoto7 = {value: INESTABILIDAD_POR_LICUACION_ESTATICA_YES};
  // Condicion: Módulo de rigidez y resistencia al corte del muro: (Evento C2)
  const eventsModulosDeformacionResistenciaMuroC2 = [{value: INESTABILIDAD_POR_LICUACION_ESTATICA_YES}];
  // Condicion: Presiones de poros: (Evento B5 o superior)
  const eventsPresionPorosB51 = [{value: INESTABILIDAD_POR_LICUACION_ESTATICA_NO}];
  const eventsPresionPorosB52 = [{value: INESTABILIDAD_POR_LICUACION_ESTATICA_NO}];
  const eventsPresionPorosB53 = [{value: INESTABILIDAD_POR_LICUACION_ESTATICA_NO}];
  const eventsPresionPorosB54 = [{value: INESTABILIDAD_POR_LICUACION_ESTATICA_YES}];
  const eventsPresionPorosB61 = [{value: INESTABILIDAD_POR_LICUACION_ESTATICA_NO}];
  const eventsPresionPorosB62 = [{value: INESTABILIDAD_POR_LICUACION_ESTATICA_NO}];
  const eventsPresionPorosB63 = [{value: INESTABILIDAD_POR_LICUACION_ESTATICA_YES}];
  const eventsPresionPorosC11 = [{value: INESTABILIDAD_POR_LICUACION_ESTATICA_NO}];
  const eventsPresionPorosC12 = [{value: INESTABILIDAD_POR_LICUACION_ESTATICA_YES}];
  const eventsPresionPorosC13 = [{value: INESTABILIDAD_POR_LICUACION_ESTATICA_NO}];
  const eventsPresionPorosC14 = [{value: INESTABILIDAD_POR_LICUACION_ESTATICA_NO}];
  const eventsPresionPorosC15 = [{value: INESTABILIDAD_POR_LICUACION_ESTATICA_NO}];
  const eventsPresionPorosC21 = [{value: INESTABILIDAD_POR_LICUACION_ESTATICA_NO}];
  const eventsPresionPorosC22 = [{value: INESTABILIDAD_POR_LICUACION_ESTATICA_YES}];
  const eventsPresionPorosD1 = [{value: INESTABILIDAD_POR_LICUACION_ESTATICA_NO}];
  const eventsPresionPorosD2 = [{value: INESTABILIDAD_POR_LICUACION_ESTATICA_YES}];

  const seriesSaveMock = jest.fn();
  const seriesQueryMock = async ({head: name}) => ({
    // Condicion1.General
    "*.terremoto-4-6": terremoto46,
    "*.terremoto-7": terremoto7,
    // Condicion: Condicion: Módulo de rigidez y resistencia al corte del muro: (Evento C2)
    "*.modulos-deformacion-resistencia-muro.C2": eventsModulosDeformacionResistenciaMuroC2
  })[name];
  const seriesQueryAllMock = async ({head: name}) => ({
    // Condicion: Condicion: Módulo de rigidez y resistencia al corte del muro: (Evento C2)
    "*.modulos-deformacion-resistencia-muro.C2": eventsModulosDeformacionResistenciaMuroC2,
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
  const refsGetManyMock = async (eventsModulosDeformacionResistenciaMuroC2) => ({
    // Condicion: Módulo de rigidez y resistencia al corte del muro: (Evento C2)
    "*.modulos-deformacion-resistencia-muro.C2": eventsModulosDeformacionResistenciaMuroC2
  })[eventsModulosDeformacionResistenciaMuroC2];
  const refsExpandMock = async (eventsModulosDeformacionResistenciaMuroC2) => ({
    // Condicion: Módulo de rigidez y resistencia al corte del muro: (Evento C2)
    "*.modulos-deformacion-resistencia-muro.C2": eventsModulosDeformacionResistenciaMuroC2
  })[eventsModulosDeformacionResistenciaMuroC2];
  const refsGetOneMock = async (eventsModulosDeformacionResistenciaMuroC2) => ({
    // Condicion: Módulo de rigidez y resistencia al corte del muro: (Evento C2)
    "*.modulos-deformacion-resistencia-muro.C2": eventsModulosDeformacionResistenciaMuroC2
  })[eventsModulosDeformacionResistenciaMuroC2];
  const refsMatchMock = async (eventsModulosDeformacionResistenciaMuroC2) => ({
    // Condicion: Módulo de rigidez y resistencia al corte del muro: (Evento C2)
    "*.modulos-deformacion-resistencia-muro.C2": eventsModulosDeformacionResistenciaMuroC2
  })[eventsModulosDeformacionResistenciaMuroC2];
  const assertMock = (x) => {
    if (typeof x === "undefined" || x === null) {
      throw new Error("assert!");
    }
    return x;
  }
  const debug = (msg) => console.log("DEBUG:", msg);

  await script({
    refs: {
      getMany: refsGetManyMock,
      expand: refsExpandMock,
      getOne: refsGetOneMock,
      match: refsMatchMock,
    },
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
