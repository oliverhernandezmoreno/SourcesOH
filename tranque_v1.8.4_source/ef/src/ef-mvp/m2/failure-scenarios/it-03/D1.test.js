const utilsIsDefinedMock = (x) => typeof x !== "undefined";

const INESTABILIDAD_POR_LICUACION_ESTATICA_YES = + true;  // 1
const INESTABILIDAD_POR_LICUACION_ESTATICA_NO  = + false; // 0

test("script return true when: "+
  "a) Evento D1: " +
  "Se deben cumplir todos los eventos en un sector para activar el escenario de falla:" +
  "Eventos Módulo 2: " +
  "• Módulo de rigidez y resistencia al corte del muro: (Evento D1)", async () => {
  const expected = Boolean(INESTABILIDAD_POR_LICUACION_ESTATICA_YES);
  // Condicion: Módulo de rigidez y resistencia al corte del muro: (Evento D1)
  const eventsModuloResistenciaCorteMuroD1 = [{value: INESTABILIDAD_POR_LICUACION_ESTATICA_YES}];

  const seriesSaveMock = jest.fn();
  const seriesQueryAllMock = async ({head: name}) => ({
    // Condicion: Módulo de rigidez y resistencia al corte del muro: (Evento D1)
    "*.modulos-deformacion-resistencia-muro.D1": eventsModuloResistenciaCorteMuroD1
  })[name];
  const seriesQueryMock = async ({head: name}) => ({
    // Condicion: Módulo de rigidez y resistencia al corte del muro: (Evento D1)
    "*.modulos-deformacion-resistencia-muro.D1": eventsModuloResistenciaCorteMuroD1
  })[name];
  const refsGetManyMock = async (eventsModuloResistenciaCorteMuroD1) => ({
    // Condicion: Módulo de rigidez y resistencia al corte del muro: (Evento D1)
    "*.modulos-deformacion-resistencia-muro.D1": eventsModuloResistenciaCorteMuroD1
  })[eventsModuloResistenciaCorteMuroD1];
  const refsExpandMock = async (eventsModuloResistenciaCorteMuroD1) => ({
    // Condicion: Módulo de rigidez y resistencia al corte del muro: (Evento D1)
    "*.modulos-deformacion-resistencia-muro.D1": eventsModuloResistenciaCorteMuroD1
  })[eventsModuloResistenciaCorteMuroD1];
  const refsGetOneMock = async (eventsModuloResistenciaCorteMuroD1) => ({
    // Condicion: Módulo de rigidez y resistencia al corte del muro: (Evento D1)
    "*.modulos-deformacion-resistencia-muro.D1": eventsModuloResistenciaCorteMuroD1
  })[eventsModuloResistenciaCorteMuroD1];
  const refsMatchMock = async (eventsModuloResistenciaCorteMuroD1) => ({
    // Condicion: Módulo de rigidez y resistencia al corte del muro: (Evento D1)
    "*.modulos-deformacion-resistencia-muro.D1": eventsModuloResistenciaCorteMuroD1
  })[eventsModuloResistenciaCorteMuroD1];
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
      queryAll: seriesQueryAllMock,
      query: seriesQueryMock,
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
  "a) Evento D1: " +
  "Se deben cumplir todos los eventos en un sector para activar el escenario de falla:" +
  "Eventos Módulo 2: " +
  "• Módulo de rigidez y resistencia al corte del muro: (Evento D1)", async () => {
  const expected = Boolean(INESTABILIDAD_POR_LICUACION_ESTATICA_NO);
  // Condicion: Módulo de rigidez y resistencia al corte del muro: (Evento D1)
  const eventsModuloResistenciaCorteMuroD1 = [{value: INESTABILIDAD_POR_LICUACION_ESTATICA_NO}];

  const seriesSaveMock = jest.fn();
  const seriesQueryAllMock = async ({head: name}) => ({
    // Condicion: Módulo de rigidez y resistencia al corte del muro: (Evento D1)
    "*.modulos-deformacion-resistencia-muro.D1": eventsModuloResistenciaCorteMuroD1
  })[name];
  const seriesQueryMock = async ({head: name}) => ({
    // Condicion: Módulo de rigidez y resistencia al corte del muro: (Evento D1)
    "*.modulos-deformacion-resistencia-muro.D1": eventsModuloResistenciaCorteMuroD1
  })[name];
  const refsGetManyMock = async (eventsModuloResistenciaCorteMuroD1) => ({
    // Condicion: Módulo de rigidez y resistencia al corte del muro: (Evento D1)
    "*.modulos-deformacion-resistencia-muro.D1": eventsModuloResistenciaCorteMuroD1
  })[eventsModuloResistenciaCorteMuroD1];
  const refsExpandMock = async (eventsModuloResistenciaCorteMuroD1) => ({
    // Condicion: Módulo de rigidez y resistencia al corte del muro: (Evento D1)
    "*.modulos-deformacion-resistencia-muro.D1": eventsModuloResistenciaCorteMuroD1
  })[eventsModuloResistenciaCorteMuroD1];
  const refsGetOneMock = async (eventsModuloResistenciaCorteMuroD1) => ({
    // Condicion: Módulo de rigidez y resistencia al corte del muro: (Evento D1)
    "*.modulos-deformacion-resistencia-muro.D1": eventsModuloResistenciaCorteMuroD1
  })[eventsModuloResistenciaCorteMuroD1];
  const refsMatchMock = async (eventsModuloResistenciaCorteMuroD1) => ({
    // Condicion: Módulo de rigidez y resistencia al corte del muro: (Evento D1)
    "*.modulos-deformacion-resistencia-muro.D1": eventsModuloResistenciaCorteMuroD1
  })[eventsModuloResistenciaCorteMuroD1];
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
      queryAll: seriesQueryAllMock,
      query: seriesQueryMock,
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
