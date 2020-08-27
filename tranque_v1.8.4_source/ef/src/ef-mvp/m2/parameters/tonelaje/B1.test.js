const utilsIsDefinedMock = (x) => typeof x !== "undefined";

const name = "ef-mvp.m2.parameters.tonelaje";

const TONELAJE_YES = + true;  // 1
const TONELAJE_NO  = + false; // 0

test("script return true when: " +
  "Se activan cuando tonelaje es mayor al valor umbral", async () => {
  const expected = Boolean(TONELAJE_YES);
  const values = [
    {value: 200000},
  ];
  const threshold = {
    canonical_name: name,
    active_thresholds: [
      { upper: 195000 },
    ],
  };
  const seriesSaveMock = jest.fn();
  const seriesQueryAllMock = async () => values;
  const refsGetOneMock = async () => threshold;

  const debug = (msg) => console.log("DEBUG:", msg);

  await script({
    refs: {
      getOne: refsGetOneMock,
    },
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

test("script return false when: " +
  "Se activan cuando tonelaje es mayor al valor umbral", async () => {
  const expected = Boolean(TONELAJE_NO);
  const values = [
    {value: 190000},
  ];
  const threshold = {
    canonical_name: name,
    active_thresholds: [
      { upper: 195000 },
    ],
  };
  const seriesSaveMock = jest.fn();
  const seriesQueryAllMock = async () => values;
  const refsGetOneMock = async () => threshold;

  const debug = (msg) => console.log("DEBUG:", msg);

  await script({
    refs: {
      getOne: refsGetOneMock,
    },
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
