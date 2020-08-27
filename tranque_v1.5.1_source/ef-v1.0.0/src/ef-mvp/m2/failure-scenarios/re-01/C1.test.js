const utilsIsDefinedMock = (x) => typeof x !== "undefined";

const REBALSE_PERDIDA_REVANCHA_HIDRAULICA_LLUVIA_INTENSA_YES = + true;  // 1
const REBALSE_PERDIDA_REVANCHA_HIDRAULICA_LLUVIA_INTENSA_NO  = + false; // 0

test("script return true when: "+
  "Evento C1 de Condiciones asociadas a los escenarios de falla Módulo 2 Re-01 Rebalse por pérdida de revancha hidráulica durante lluvia intensa", async () => {
  const expected = Boolean(REBALSE_PERDIDA_REVANCHA_HIDRAULICA_LLUVIA_INTENSA_YES);
  const lluviaB1 = {value: REBALSE_PERDIDA_REVANCHA_HIDRAULICA_LLUVIA_INTENSA_YES};
  const revanchaHidraulicaB1 = {value: REBALSE_PERDIDA_REVANCHA_HIDRAULICA_LLUVIA_INTENSA_YES};
  const potencialRebalseB4 = {value: REBALSE_PERDIDA_REVANCHA_HIDRAULICA_LLUVIA_INTENSA_YES};

  const seriesSaveMock = jest.fn();
  const seriesQueryMock = async ({head: name}) => ({
    "*.lluvia.B1": lluviaB1,
    "*.revancha-hidraulica.B1": revanchaHidraulicaB1,
    "*.potencial-rebalse.B4": potencialRebalseB4,
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
  "Evento C1 de Condiciones asociadas a los escenarios de falla Módulo 2 Re-01 Rebalse por pérdida de revancha hidráulica durante lluvia intensa", async () => {
  const expected = Boolean(REBALSE_PERDIDA_REVANCHA_HIDRAULICA_LLUVIA_INTENSA_NO);
  const lluviaB1 = {value: REBALSE_PERDIDA_REVANCHA_HIDRAULICA_LLUVIA_INTENSA_NO};
  const revanchaHidraulicaB1 = {value: REBALSE_PERDIDA_REVANCHA_HIDRAULICA_LLUVIA_INTENSA_YES};
  const potencialRebalseB4 = {value: REBALSE_PERDIDA_REVANCHA_HIDRAULICA_LLUVIA_INTENSA_YES};

  const seriesSaveMock = jest.fn();
  const seriesQueryMock = async ({head: name}) => ({
    "*.lluvia.B1": lluviaB1,
    "*.revancha-hidraulica.B1": revanchaHidraulicaB1,
    "*.potencial-rebalse.B4": potencialRebalseB4,
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
