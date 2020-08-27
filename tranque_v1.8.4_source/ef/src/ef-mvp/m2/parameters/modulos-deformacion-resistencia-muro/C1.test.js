const utilsIsDefinedMock = (x) => typeof x !== "undefined";

const MODULOS_DEFORMACION_RESITENCIA_C1_YES = + true;  // 1
const MODULOS_DEFORMACION_RESITENCIA_C1_NO  = + false; // 0

test("script return true when " +
  "Evento C1: (Se informa por sector) " +
  "En caso de mantenerse activo por un tiempo “α” el Evento C1 se activa automáticamente.", async () => {
  const expected = Boolean(MODULOS_DEFORMACION_RESITENCIA_C1_NO);
  const alfa = {value: 4};
  const values = [
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES}, // 0 => t0 => 1
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES}, // 0 => t1 => 1
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES}, // 0 => t2 => 1
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES}, // 0 => t3 => 1
  ];
  const minutesago = "2020-05-04T00:00:00";
  const timeframe = {end: "2020-05-15T00:00:00"};

  const seriesSaveMock = jest.fn();
  const minutesAgoMock = async () => minutesago;
  const timeframeMock = async () => timeframe;
  const seriesQueryMock = async () => values;
  const refsParamMock = async () => alfa;
  const debug = (msg) => console.log("DEBUG:", msg);

  await script({
    refs: {
      param: refsParamMock,
    },
    series: {
      query: seriesQueryMock,
      yield: seriesSaveMock,
    },
    utils: {
      isDefined: utilsIsDefinedMock,
      debug: debug,
      minutesAgo: minutesAgoMock,
    },
    ctx: {
      timeframe: timeframeMock,
    },
  });

  // assert
  expect(seriesSaveMock.mock.calls.length)
    .toEqual(1);
  expect(seriesSaveMock.mock.calls[0][0])
     .toEqual(expected);
});

test("script return false when " +
  "Evento C1: (Se informa por sector) " +
  "En caso de mantenerse activo por un tiempo “α” el Evento C1 se activa automáticamente.", async () => {
  const expected = Boolean(MODULOS_DEFORMACION_RESITENCIA_C1_NO);
  const alfa = {value: 40};
  const values = [
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_NO},  // 0 => t0 => 0
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES}, // 1 => t1 => 1
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES},
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES},
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES},
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES},
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES},
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES},
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES},
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES},
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES},
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES},
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES},
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES},
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES},
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES},
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES},
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES},
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES},
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES},
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES},
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES},
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES},
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES},
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES},
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES},
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES},
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES},
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES},
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES},
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES},
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES},
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES},
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES},
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES},
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES},
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES},
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES},
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES},
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES},
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES},
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES},
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES},
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES},
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES},
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES},
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES},
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES},
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES},
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES}, // 50 => t50 => 0
  ];
  const minutesago = "2020-05-04T00:00:00";
  const timeframe = {end: "2020-05-15T00:00:00"};

  const seriesSaveMock = jest.fn();
  const minutesAgoMock = async () => minutesago;
  const timeframeMock = async () => timeframe;
  const seriesQueryMock = async () => values;
  const refsParamMock = async () => alfa;
  const debug = (msg) => console.log("DEBUG:", msg);

  await script({
    refs: {
      param: refsParamMock,
    },
    series: {
      query: seriesQueryMock,
      yield: seriesSaveMock,
    },
    utils: {
      isDefined: utilsIsDefinedMock,
      debug: debug,
      minutesAgo: minutesAgoMock,
    },
    ctx: {
      timeframe: timeframeMock,
    },
  });

  // assert
  expect(seriesSaveMock.mock.calls.length)
    .toEqual(1);
  expect(seriesSaveMock.mock.calls[0][0])
    .toEqual(expected);
});

test("script return false when " +
  "Evento C1: (Se informa por sector) " +
  "En caso de mantenerse activo por un tiempo “α” el Evento C1 se activa automáticamente.", async () => {
  const expected = Boolean(MODULOS_DEFORMACION_RESITENCIA_C1_YES);
  const alfa = {value: 49};
  const values = [
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES}, // 0 => t0 => 1
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES},
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES},
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES},
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES},
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES},
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES},
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES},
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES},
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES},
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES},
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES},
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES},
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES},
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES},
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES},
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES},
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES},
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES},
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES},
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES},
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES},
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES},
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES},
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES},
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES},
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES},
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES},
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES},
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES},
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES},
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES},
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES},
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES},
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES},
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES},
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES},
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES},
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES},
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES},
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES},
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES},
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES},
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES},
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES},
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES},
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES},
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES},
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_YES}, // 49 => t49 => 0
    {value: MODULOS_DEFORMACION_RESITENCIA_C1_NO},  // 50 => t50 => 0
  ];
  const minutesago = "2020-05-04T00:00:00";
  const timeframe = {end: "2020-05-15T00:00:00"};

  const seriesSaveMock = jest.fn();
  const minutesAgoMock = async () => minutesago;
  const timeframeMock = async () => timeframe;
  const seriesQueryMock = async () => values;
  const refsParamMock = async () => alfa;
  const debug = (msg) => console.log("DEBUG:", msg);

  await script({
    refs: {
      param: refsParamMock,
    },
    series: {
      query: seriesQueryMock,
      yield: seriesSaveMock,
    },
    utils: {
      isDefined: utilsIsDefinedMock,
      debug: debug,
      minutesAgo: minutesAgoMock,
    },
    ctx: {
      timeframe: timeframeMock,
    },
  });

  // assert
  expect(seriesSaveMock.mock.calls.length)
    .toEqual(1);
  expect(seriesSaveMock.mock.calls[0][0])
    .toEqual(expected);
});
