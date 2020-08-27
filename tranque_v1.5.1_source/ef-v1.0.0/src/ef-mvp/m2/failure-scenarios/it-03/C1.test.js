const utilsIsDefinedMock = (x) => typeof x !== "undefined";

const INESTABILIDAD_POR_LICUACION_ESTATICA_YES = + true;  // 1
const INESTABILIDAD_POR_LICUACION_ESTATICA_NO  = + false; // 0

test("script return true when: "+
  "a) Evento C1:" +
  "Se deben cumplir todos los eventos en un sector para activar el escenario de falla: " +
  "Eventos Módulo 2: " +
  "• Módulo de rigidez y resistencia al corte del muro: (Evento C2) " +
  "• Presiones de poro: (Evento C1 o superior)", async () => {
  const expected = Boolean(INESTABILIDAD_POR_LICUACION_ESTATICA_YES);
  // Condicion: Módulo de rigidez y resistencia al corte del muro: (Evento C2)
  const eventsModuloResistenciaCorteMuroC2 = [{value: INESTABILIDAD_POR_LICUACION_ESTATICA_YES}];
  // Condicion: Presiones de poros: (Evento C1 o superior)
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
  const seriesQueryAllMock = async ({head: name}) => ({
    // Condicion: Módulo de rigidez y resistencia al corte del muro: (Evento C2)
    "*.modulos-deformacion-resistencia-muro.C2": eventsModuloResistenciaCorteMuroC2,
    // Condicion: Presiones de poros: (Evento B5 o superior)
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

test("script return false when: "+
  "a) Evento C1:" +
  "Se deben cumplir todos los eventos en un sector para activar el escenario de falla: " +
  "Eventos Módulo 2: " +
  "• Módulo de rigidez y resistencia al corte del muro: (Evento C2) " +
  "• Presiones de poro: (Evento C1 o superior)", async () => {
  const expected = Boolean(INESTABILIDAD_POR_LICUACION_ESTATICA_NO);
  // Condicion: Módulo de rigidez y resistencia al corte del muro: (Evento C2)
  const eventsModuloResistenciaCorteMuroC2 = [{value: INESTABILIDAD_POR_LICUACION_ESTATICA_YES}];
  // Condicion: Presiones de poros: (Evento C1 o superior)
  const eventsPresionPorosC11 = [{value: INESTABILIDAD_POR_LICUACION_ESTATICA_NO}];
  const eventsPresionPorosC12 = [{value: INESTABILIDAD_POR_LICUACION_ESTATICA_NO}];
  const eventsPresionPorosC13 = [{value: INESTABILIDAD_POR_LICUACION_ESTATICA_NO}];
  const eventsPresionPorosC14 = [{value: INESTABILIDAD_POR_LICUACION_ESTATICA_NO}];
  const eventsPresionPorosC15 = [{value: INESTABILIDAD_POR_LICUACION_ESTATICA_NO}];
  const eventsPresionPorosC21 = [{value: INESTABILIDAD_POR_LICUACION_ESTATICA_NO}];
  const eventsPresionPorosC22 = [{value: INESTABILIDAD_POR_LICUACION_ESTATICA_NO}];
  const eventsPresionPorosD1 = [{value: INESTABILIDAD_POR_LICUACION_ESTATICA_NO}];
  const eventsPresionPorosD2 = [{value: INESTABILIDAD_POR_LICUACION_ESTATICA_NO}];

  const seriesSaveMock = jest.fn();
  const seriesQueryAllMock = async ({head: name}) => ({
    // Condicion: Módulo de rigidez y resistencia al corte del muro: (Evento C2)
    "*.modulos-deformacion-resistencia-muro.C2": eventsModuloResistenciaCorteMuroC2,
    // Condicion: Presiones de poros: (Evento B5 o superior)
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

test("script return true when: "+
  "a) Evento C1:" +
  "Se deben cumplir todos los eventos en un sector para activar el escenario de falla: " +
  "Eventos Módulo 2: " +
  "• Módulo de rigidez y resistencia al corte del muro: (Evento C2) " +
  "• Presiones de poro: (Evento C1 o superior)", async () => {
  const expected = Boolean(INESTABILIDAD_POR_LICUACION_ESTATICA_YES);
  // Condicion: Módulo de rigidez y resistencia al corte del muro: (Evento C2)
  const eventsModuloResistenciaCorteMuroC2 = [{value: INESTABILIDAD_POR_LICUACION_ESTATICA_YES}];
  // Condicion: Presiones de poros: (Evento C1 o superior)
  const eventsPresionPorosC11 = [{value: INESTABILIDAD_POR_LICUACION_ESTATICA_YES}];
  const eventsPresionPorosC12 = [{value: INESTABILIDAD_POR_LICUACION_ESTATICA_NO}];
  const eventsPresionPorosC13 = [{value: INESTABILIDAD_POR_LICUACION_ESTATICA_NO}];
  const eventsPresionPorosC14 = [{value: INESTABILIDAD_POR_LICUACION_ESTATICA_NO}];
  const eventsPresionPorosC15 = [{value: INESTABILIDAD_POR_LICUACION_ESTATICA_NO}];
  const eventsPresionPorosC21 = [{value: INESTABILIDAD_POR_LICUACION_ESTATICA_NO}];
  const eventsPresionPorosC22 = [{value: INESTABILIDAD_POR_LICUACION_ESTATICA_NO}];
  const eventsPresionPorosD1 = [{value: INESTABILIDAD_POR_LICUACION_ESTATICA_NO}];
  const eventsPresionPorosD2 = [{value: INESTABILIDAD_POR_LICUACION_ESTATICA_NO}];

  const seriesSaveMock = jest.fn();
  const seriesQueryAllMock = async ({head: name}) => ({
    // Condicion: Módulo de rigidez y resistencia al corte del muro: (Evento C2)
    "*.modulos-deformacion-resistencia-muro.C2": eventsModuloResistenciaCorteMuroC2,
    // Condicion: Presiones de poros: (Evento B5 o superior)
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
