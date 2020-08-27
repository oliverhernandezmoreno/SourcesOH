const utilsIsDefinedMock = (x) => typeof x !== "undefined";

const INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES = + true;  // 1
const INESTABILIDAD_POR_DESLIZAMIENTO_MURO_NO  = + false; // 0

test("script return true when: "+
  "Se deben cumplir todos los eventos en un sector para activar el escenario de falla: "+
  "Eventos Módulo 2:" +
  "• Escenario de falla IT-06: (Evento C1)" +
  "Adicionalmente se cumple al menos uno de los siguientes se debe solicitar confirmación manual de Alerta Roja:" +
  "• Presiones de poros: (Protocolo B5 o superior)" +
  "• Presiones de poros: (Protocolo B1 o B2)", async () => {
  const expected = Boolean(INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES);
  // Condicion: Se deben cumplir todos los eventos en un sector para activar el escenario de falla
  const eventsFailureScenariosIT06C1 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES}];
  // Condicion: Presiones de poros: (Evento C1 o superior)
  const eventsPresionPorosB51 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES}];
  const eventsPresionPorosB52 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES}];
  const eventsPresionPorosB53 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES}];
  const eventsPresionPorosB54 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES}];
  const eventsPresionPorosB61 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES}];
  const eventsPresionPorosB62 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES}];
  const eventsPresionPorosB63 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES}];
  const eventsPresionPorosB1 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES}];
  const eventsPresionPorosB2 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES}];

  const seriesSaveMock = jest.fn();
  const seriesQueryAllMock = async ({head: name}) => ({
    // Condicion: Módulo de rigidez y resistencia al corte del muro: (Evento C2)
    "*.failure-scenarios.it-06.C1": eventsFailureScenariosIT06C1,
    // Condicion: Presiones de poros: (Evento B5 o superior)
    "*.B5-1": eventsPresionPorosB51,
    "*.B5-2": eventsPresionPorosB52,
    "*.B5-3": eventsPresionPorosB53,
    "*.B5-4": eventsPresionPorosB54,
    "*.B6-1": eventsPresionPorosB61,
    "*.B6-2": eventsPresionPorosB62,
    "*.B6-3": eventsPresionPorosB63,
    "*.B1": eventsPresionPorosB1,
    "*.B2": eventsPresionPorosB2
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
