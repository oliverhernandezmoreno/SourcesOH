const utilsIsDefinedMock = (x) => typeof x !== "undefined";

const REBALSE_PERDIDA_REVANCHA_HIDRAULICA_LLUVIA_INTENSA_YES = + true;  // 1
const REBALSE_PERDIDA_REVANCHA_HIDRAULICA_LLUVIA_INTENSA_NO  = + false; // 0

test("script return false when: "+
  "Re-01 Rebalse por pérdida de revancha hidráulica durante lluvia intensa "+
  "Eventos Grupo D"+
  "a) Evento D1"+
  "Se deben cumplir todos los eventos en un sector para activar el escenario de falla"+
  "Eventos Módulo 2"+
  "Escenario de falla Re-01 Evento C1", async () => {
  const expected = Boolean(REBALSE_PERDIDA_REVANCHA_HIDRAULICA_LLUVIA_INTENSA_NO);
  const lluviaB1 = [{value: REBALSE_PERDIDA_REVANCHA_HIDRAULICA_LLUVIA_INTENSA_YES}];
  const revanchaHidraulicaB1 = [{value: REBALSE_PERDIDA_REVANCHA_HIDRAULICA_LLUVIA_INTENSA_YES}];
  const potencialRebalseB4 = [{value: REBALSE_PERDIDA_REVANCHA_HIDRAULICA_LLUVIA_INTENSA_YES}];
  const potencialRebalseB3 = [{value: REBALSE_PERDIDA_REVANCHA_HIDRAULICA_LLUVIA_INTENSA_NO}];

  const seriesSaveMock = jest.fn();
  const seriesQueryAllMock = async ({head: name}) => ({
    "*.lluvia": lluviaB1,
    "*.revancha-hidraulica.B1": revanchaHidraulicaB1,
    "*.potencial-rebalse.B4": potencialRebalseB4,
    "*.potencial-rebalse.B3": potencialRebalseB3
  })[name];
  const debug = (msg) => console.log("DEBUG:", msg);

  await script({
    series: {
      queryAll: seriesQueryAllMock,
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

test("script return true when: "+
  "Re-01 Rebalse por pérdida de revancha hidráulica durante lluvia intensa "+
  "Eventos Grupo D"+
  "a) Evento D1"+
  "Se deben cumplir todos los eventos en un sector para activar el escenario de falla"+
  "Eventos Módulo 2"+
  "Escenario de falla Re-01 Evento C1", async () => {
  const expected = Boolean(REBALSE_PERDIDA_REVANCHA_HIDRAULICA_LLUVIA_INTENSA_YES);
  const lluviaB1 = [{value: REBALSE_PERDIDA_REVANCHA_HIDRAULICA_LLUVIA_INTENSA_YES}];
  const revanchaHidraulicaB1 = [{value: REBALSE_PERDIDA_REVANCHA_HIDRAULICA_LLUVIA_INTENSA_YES}];
  const potencialRebalseB4 = [{value: REBALSE_PERDIDA_REVANCHA_HIDRAULICA_LLUVIA_INTENSA_YES}];
  const potencialRebalseB3 = [{value: REBALSE_PERDIDA_REVANCHA_HIDRAULICA_LLUVIA_INTENSA_YES}];

  const seriesSaveMock = jest.fn();
  const seriesQueryAllMock = async ({head: name}) => ({
    "*.lluvia": lluviaB1,
    "*.revancha-hidraulica.B1": revanchaHidraulicaB1,
    "*.potencial-rebalse.B4": potencialRebalseB4,
    "*.potencial-rebalse.B3": potencialRebalseB3
  })[name];
  const debug = (msg) => console.log("DEBUG:", msg);

  await script({
    series: {
      queryAll: seriesQueryAllMock,
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
