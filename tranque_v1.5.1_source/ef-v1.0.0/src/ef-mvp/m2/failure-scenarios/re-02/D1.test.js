const utilsIsDefinedMock = (x) => typeof x !== "undefined";

const REBALSE_OLA_DEBIDO_ESLIZAMIENTO_YES = + true;  // 1
const REBALSE_OLA_DEBIDO_ESLIZAMIENTO_NO  = + false; // 0

test("script return true when: "+
  "Se deben cumplir todos los eventos en un sector para activar el escenario de falla "+
  "Eventos Módulo 1 " +
  "Evento gatillador: Deslizamiento inminente hacia el interior de la laguna (Evento C)", async () => {
  const expected = Boolean(REBALSE_OLA_DEBIDO_ESLIZAMIENTO_YES);
  const lastDeslizamientoInminente = {value: REBALSE_OLA_DEBIDO_ESLIZAMIENTO_YES};
  const lastConfirmacionManualD1 = {value: REBALSE_OLA_DEBIDO_ESLIZAMIENTO_YES};

  const seriesSaveMock = jest.fn();
  const seriesQueryMock = async ({head: name}) => ({
    "*.deslizamiento-inminente": lastDeslizamientoInminente,
    "*.confirmacion-manual-D1": lastConfirmacionManualD1
  })[name];
  const debug = (msg) => console.log("DEBUG:", msg);

  await script({
    series: {
      query: seriesQueryMock,
      yield: seriesSaveMock,
    },
    utils: {
      isDefined: utilsIsDefinedMock,
      debug: debug,
    },
  });

  // assert
  expect(seriesSaveMock.mock.calls.length)
    .toEqual(1);
  expect(seriesSaveMock.mock.calls[0][0])
    .toEqual(expected);
});

test("script return false when: "+
  "Se deben cumplir todos los eventos en un sector para activar el escenario de falla "+
  "Eventos Módulo 1 " +
  "Evento gatillador: Deslizamiento inminente hacia el interior de la laguna (Evento C)", async () => {
  const expected = Boolean(REBALSE_OLA_DEBIDO_ESLIZAMIENTO_NO);
  const lastDeslizamientoInminente = {value: REBALSE_OLA_DEBIDO_ESLIZAMIENTO_NO};
  const lastConfirmacionManualD1 = {value: REBALSE_OLA_DEBIDO_ESLIZAMIENTO_YES};

  const seriesSaveMock = jest.fn();
  const seriesQueryMock = async ({head: name}) => ({
    "*.deslizamiento-inminente": lastDeslizamientoInminente,
    "*.confirmacion-manual-D1": lastConfirmacionManualD1
  })[name];
  const debug = (msg) => console.log("DEBUG:", msg);

  await script({
    series: {
      query: seriesQueryMock,
      yield: seriesSaveMock,
    },
    utils: {
      isDefined: utilsIsDefinedMock,
      debug: debug,
    },
  });

  // assert
  expect(seriesSaveMock.mock.calls.length)
    .toEqual(1);
  expect(seriesSaveMock.mock.calls[0][0])
    .toEqual(expected);
});
