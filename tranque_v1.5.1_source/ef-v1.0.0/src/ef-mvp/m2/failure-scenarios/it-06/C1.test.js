const utilsIsDefinedMock = (x) => typeof x !== "undefined";

const INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES = + true;  // 1
const INESTABILIDAD_POR_DESLIZAMIENTO_MURO_NO  = + false; // 0

test("script return true when: "+
  "a) Evento C1: " +
  "Se deben cumplir todos los eventos en un sector para activar el escenario de falla: " +
  "Eventos Módulo 1: " +
  "• Evento gatillador: Deslizamiento superficial de un sector del talud del muro (Evento B)" +
  "Eventos Módulo 2:" +
  "• Evidencia de grietas en el muro del depósito: (Evento C3)", async () => {
  const expected = Boolean(INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES);
  // Condicion: Deslizamiento superficial de un sector del talud del muro
  const eventsDeslizamientoMenor = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES}];
  // Condicion: Evidencia de grietas en el muro del depósito: (Evento C3)
  const eventsEvidenciaGrietasC3 = [{value: INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES}];

  const seriesSaveMock = jest.fn();
  const seriesQueryAllMock = async ({head: name}) => ({
    // Condicion: Módulo de rigidez y resistencia al corte del muro: (Evento C2)
    "*.deslizamiento-menor": eventsDeslizamientoMenor,
    // Condicion: Presiones de poros: (Evento B5 o superior)
    "*.integridad-externa.grietas.C3": eventsEvidenciaGrietasC3
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
