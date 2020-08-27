const utilsIsDefinedMock = (x) => typeof x !== "undefined";

const REBALSE_PERDIDA_REVANCHA_HIDRAULICA_LLUVIA_INTENSA_YES = + true;  // 1
const REBALSE_PERDIDA_REVANCHA_HIDRAULICA_LLUVIA_INTENSA_NO  = + false; // 0

test("script return true when: "+
  "Evento D1 de Condiciones asociadas a los escenarios de falla Módulo 2 Re-01 Rebalse por pérdida de revancha hidráulica durante lluvia intensa", async () => {
  const expected = Boolean(REBALSE_PERDIDA_REVANCHA_HIDRAULICA_LLUVIA_INTENSA_YES);
  const lastRebalseC1 = {value: REBALSE_PERDIDA_REVANCHA_HIDRAULICA_LLUVIA_INTENSA_YES};
  const lastPotencialRebalseB3 = {value: REBALSE_PERDIDA_REVANCHA_HIDRAULICA_LLUVIA_INTENSA_YES};
  // const sector = {name: "test-ef-re-01-1.g-sector-B.ef-mvp.m2.failure-scenarios.re-01.D1"};

  const seriesSaveMock = jest.fn();
  const seriesQueryMock = async ({head: name}) => ({
    "*.re-01.C1": lastRebalseC1,
    "*.potencial-rebalse.B3": lastPotencialRebalseB3
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

test("script return true when: "+
  "Evento D1 de Condiciones asociadas a los escenarios de falla Módulo 2 Re-01 Rebalse por pérdida de revancha hidráulica durante lluvia intensa", async () => {
  const expected = Boolean(REBALSE_PERDIDA_REVANCHA_HIDRAULICA_LLUVIA_INTENSA_NO);
  const lastRebalseC1 = {value: REBALSE_PERDIDA_REVANCHA_HIDRAULICA_LLUVIA_INTENSA_YES};
  const lastPotencialRebalseB3 = {value: REBALSE_PERDIDA_REVANCHA_HIDRAULICA_LLUVIA_INTENSA_NO};
  // const sector = {name: "test-ef-re-01-1.g-sector-B.ef-mvp.m2.failure-scenarios.re-01.D1"};

  const seriesSaveMock = jest.fn();
  const seriesQueryMock = async ({head: name}) => ({
    "*.re-01.C1": lastRebalseC1,
    "*.potencial-rebalse.B3": lastPotencialRebalseB3
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
