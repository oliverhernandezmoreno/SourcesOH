const utilsIsDefinedMock = (x) => typeof x !== "undefined";


test("script A1 without active event", async () => {
  const paramSuperior = {curve: [
    {abertura: {value:0.5}, pasa: {value: 99.69}},
    {abertura: {value:0.297}, pasa: {value: 88.37}},
    {abertura: {value:0.21}, pasa: {value: 78.57}},
    {abertura: {value:0.149}, pasa: {value: 45.36}},
    {abertura: {value:0.105}, pasa: {value: 29.59}},
    {abertura: {value:0.074}, pasa: {value: 17.65}},
  ]};
  const paramInferior = {curve: [
    {abertura: {value: 0.5}, pasa: {value: 87.4}},
    {abertura: {value:0.297}, pasa: {value: 70.1}},
    {abertura: {value:0.21}, pasa: {value: 48.57}},
    {abertura: {value:0.149}, pasa: {value: 26.99}},
    {abertura: {value:0.105}, pasa: {value: 16.58}},
    {abertura: {value:0.074}, pasa: {value: 11.68}},
  ]};

  const porcentajes = [
    {
      value: 100, meta:
      {muestra: "556.0", "acumulado-pasante": [
        {malla: "35", porcentaje: 100 - 45.2 * 100 / 556, abertura: 0.5},
        {malla: "48", porcentaje: 100 - (80.1 + 45.2) * 100 / 556, abertura: 0.297},
        {malla: "65", porcentaje: 100 - (120.1 + 80.1 + 45.2) * 100 / 556, abertura: 0.21},
        {malla: "100", porcentaje: 100 - (104.6 + 120.1 + 80.1 + 45.2) * 100 / 556,
          abertura: 0.149},
        {malla: "150", porcentaje: 100 - (77.9 + 104.6 + 120.1 + 80.1 + 45.2) * 100 / 556, abertura: 0.105},
        {malla: "200", porcentaje: 100 - (43.8 + 77.9 + 104.6 + 120.1 + 80.1 + 45.2) * 100 / 556, abertura: 0.074},
        {malla: "-200", porcentaje: 100 - (84.3 + 43.8 + 77.9 + 104.6 + 120.1 + 80.1 + 45.2) * 100 / 556,
          abertura: 0}
      ]}
    },
    {
      value: 100, meta:
      {muestra: "585.6", "acumulado-pasante": [
        {malla: "35", porcentaje: 100 - 57.3 * 100 / 585.6, abertura: 0.5},
        {malla: "48", porcentaje: 100 - (89.5 + 57.3) * 100 / 585.6, abertura: 0.297},
        {malla: "65", porcentaje: 100 - (125.6 + 89.5 + 57.3) * 100 / 585.6, abertura: 0.21},
        {malla: "100", porcentaje: 100 - (100.5 + 125.6 + 89.5 + 57.3) * 100 / 585.6,
          abertura: 0.149},
        {malla: "150", porcentaje: 100 - (82.3 + 100.5 + 125.6 + 89.5 + 57.3) * 100 / 585.6, abertura: 0.105},
        {malla: "200", porcentaje: 100 - (45.8 + 82.3 + 100.5 + 125.6 + 89.5 + 57.3) * 100 / 585.6, abertura: 0.074},
        {malla: "-200", porcentaje: 100 - (84.6 + 45.8 + 82.3 + 100.5 + 125.6 + 89.5 + 57.3) * 100 / 585.6,
          abertura: 0}
      ]}
    },
  ];

  const seriesSaveMock = jest.fn();
  const seriesQueryMock = async () => porcentajes;
  const refsParamMock = async (queryRefs) => ({
    "banda-granulometrica-superior": paramSuperior,
    "banda-granulometrica-inferior": paramInferior,
  })[queryRefs];
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
    },
  });

  // assert
  expect(seriesSaveMock.mock.calls.length)
    .toEqual(1);
  expect(seriesSaveMock.mock.calls[0][0])
    .toEqual(0);

});


test("script A1 with active event for one upper case", async () => {
  const paramSuperior = {curve: [
    {abertura: {value:0.5}, pasa: {value: 99.69}},
    {abertura: {value:0.297}, pasa: {value: 88.37}},
    {abertura: {value:0.21}, pasa: {value: 78.57}},
    {abertura: {value:0.149}, pasa: {value: 45.36}},
    {abertura: {value:0.105}, pasa: {value: 29.59}},
    {abertura: {value:0.074}, pasa: {value: 17.65}},
  ]};
  const paramInferior = {curve: [
    {abertura: {value:0.5}, pasa: {value: 87.4}},
    {abertura: {value:0.297}, pasa: {value: 70.1}},
    {abertura: {value:0.21}, pasa: {value: 48.57}},
    {abertura: {value:0.149}, pasa: {value: 26.99}},
    {abertura: {value:0.105}, pasa: {value: 16.58}},
    {abertura: {value:0.074}, pasa: {value: 11.68}},
  ]};

  const porcentajes = [
    {
      value: 100, meta:
      {muestra: "556.0", "acumulado-pasante": [
        {malla: "35", porcentaje: 100 - 45.2 * 100 / 556, abertura: 0.5},
        {malla: "48", porcentaje: 100 - (80.1 + 45.2) * 100 / 556, abertura: 0.297},
        {malla: "65", porcentaje: 100 + 20 - (120.1 + 80.1 + 45.2) * 100 / 556, abertura: 0.21},
        {malla: "100", porcentaje: 100 + 20 - (104.6 + 120.1 + 80.1 + 45.2) * 100 / 556,
          abertura: 0.149},
        {malla: "150", porcentaje: 100 + 20  - (77.9 + 104.6 + 120.1 + 80.1 + 45.2) * 100 / 556, abertura: 0.105},
        {malla: "200", porcentaje: 100 + 20  - (43.8 + 77.9 + 104.6 + 120.1 + 80.1 + 45.2) * 100 / 556, abertura: 0.074},
        {malla: "-200", porcentaje: 100 + 20  - (84.3 + 43.8 + 77.9 + 104.6 + 120.1 + 80.1 + 45.2) * 100 / 556,
          abertura: 0}
      ]}
    },
    {
      value: 100, meta:
      {muestra: "585.6", "acumulado-pasante": [
        {malla: "35", porcentaje: 100 - 57.3 * 100 / 585.6, abertura: 0.5},
        {malla: "48", porcentaje: 100 - (89.5 + 57.3) * 100 / 585.6, abertura: 0.297},
        {malla: "65", porcentaje: 100 - (125.6 + 89.5 + 57.3) * 100 / 585.6, abertura: 0.21},
        {malla: "100", porcentaje: 100 - (100.5 + 125.6 + 89.5 + 57.3) * 100 / 585.6,
          abertura: 0.149},
        {malla: "150", porcentaje: 100 - (82.3 + 100.5 + 125.6 + 89.5 + 57.3) * 100 / 585.6, abertura: 0.105},
        {malla: "200", porcentaje: 100 - (45.8 + 82.3 + 100.5 + 125.6 + 89.5 + 57.3) * 100 / 585.6, abertura: 0.074},
        {malla: "-200", porcentaje: 100 - (84.6 + 45.8 + 82.3 + 100.5 + 125.6 + 89.5 + 57.3) * 100 / 585.6,
          abertura: 0}
      ]}
    },
  ];

  const seriesSaveMock = jest.fn();
  const seriesQueryMock = async () => porcentajes;
  const refsParamMock = async (queryRefs) => ({
    "banda-granulometrica-superior": paramSuperior,
    "banda-granulometrica-inferior": paramInferior,
  })[queryRefs];
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
    },
  });

  // assert
  expect(seriesSaveMock.mock.calls.length)
    .toEqual(1);
  expect(seriesSaveMock.mock.calls[0][0])
    .toEqual(1);

});


test("script A1 with active event for two upper case", async () => {
  const paramSuperior = {curve: [
    {abertura: {value:0.5}, pasa: {value: 99.69}},
    {abertura: {value:0.297}, pasa: {value: 88.37}},
    {abertura: {value:0.21}, pasa: {value: 78.57}},
    {abertura: {value:0.149}, pasa: {value: 45.36}},
    {abertura: {value:0.105}, pasa: {value: 29.59}},
    {abertura: {value:0.074}, pasa: {value: 17.65}},
  ]};
  const paramInferior = {curve: [
    {abertura: {value:0.5}, pasa: {value: 87.4}},
    {abertura: {value:0.297}, pasa: {value: 70.1}},
    {abertura: {value:0.21}, pasa: {value: 48.57}},
    {abertura: {value:0.149}, pasa: {value: 26.99}},
    {abertura: {value:0.105}, pasa: {value: 16.58}},
    {abertura: {value:0.074}, pasa: {value: 11.68}},
  ]};

  const porcentajes = [
    {
      value: 100, meta:
      {muestra: "556.0", "acumulado-pasante": [
        {malla: "35", porcentaje: 100 - 45.2 * 100 / 556, abertura: 0.5},
        {malla: "48", porcentaje: 100 - (80.1 + 45.2) * 100 / 556, abertura: 0.297},
        {malla: "65", porcentaje: 100 + 20 - (120.1 + 80.1 + 45.2) * 100 / 556, abertura: 0.21},
        {malla: "100", porcentaje: 100 + 20 - (104.6 + 120.1 + 80.1 + 45.2) * 100 / 556,
          abertura: 0.149},
        {malla: "150", porcentaje: 100 + 20  - (77.9 + 104.6 + 120.1 + 80.1 + 45.2) * 100 / 556, abertura: 0.105},
        {malla: "200", porcentaje: 100 + 20  - (43.8 + 77.9 + 104.6 + 120.1 + 80.1 + 45.2) * 100 / 556, abertura: 0.074},
        {malla: "-200", porcentaje: 100 + 20  - (84.3 + 43.8 + 77.9 + 104.6 + 120.1 + 80.1 + 45.2) * 100 / 556,
          abertura: 0}
      ]}
    },
    {
      value: 100, meta:
      {muestra: "585.6", "acumulado-pasante": [
        {malla: "35", porcentaje: 100 - 57.3 * 100 / 585.6, abertura: 0.5},
        {malla: "48", porcentaje: 100 - (89.5 + 57.3) * 100 / 585.6, abertura: 0.297},
        {malla: "65", porcentaje: 100 - (125.6 + 89.5 + 57.3) * 100 / 585.6, abertura: 0.21},
        {malla: "100", porcentaje: 100 - (100.5 + 125.6 + 89.5 + 57.3) * 100 / 585.6,
          abertura: 0.149},
        {malla: "150", porcentaje: 100 + 20 - (82.3 + 100.5 + 125.6 + 89.5 + 57.3) * 100 / 585.6, abertura: 0.105},
        {malla: "200", porcentaje: 100 + 20 - (45.8 + 82.3 + 100.5 + 125.6 + 89.5 + 57.3) * 100 / 585.6, abertura: 0.074},
        {malla: "-200", porcentaje: 100 + 20 - (84.6 + 45.8 + 82.3 + 100.5 + 125.6 + 89.5 + 57.3) * 100 / 585.6,
          abertura: 0}
      ]}
    },
  ];

  const seriesSaveMock = jest.fn();
  const seriesQueryMock = async () => porcentajes;
  const refsParamMock = async (queryRefs) => ({
    "banda-granulometrica-superior": paramSuperior,
    "banda-granulometrica-inferior": paramInferior,
  })[queryRefs];
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
    },
  });

  // assert
  expect(seriesSaveMock.mock.calls.length)
    .toEqual(1);
  expect(seriesSaveMock.mock.calls[0][0])
    .toEqual(1);

});


test("script A1 with active event for one lower case", async () => {
  const paramSuperior = {curve: [
    {abertura: {value:0.5}, pasa: {value: 99.69}},
    {abertura: {value:0.297}, pasa: {value: 88.37}},
    {abertura: {value:0.21}, pasa: {value: 78.57}},
    {abertura: {value:0.149}, pasa: {value: 45.36}},
    {abertura: {value:0.105}, pasa: {value: 29.59}},
    {abertura: {value:0.074}, pasa: {value: 17.65}},
  ]};
  const paramInferior = {curve: [
    {abertura: {value:0.5}, pasa: {value: 87.4}},
    {abertura: {value:0.297}, pasa: {value: 70.1}},
    {abertura: {value:0.21}, pasa: {value: 48.57}},
    {abertura: {value:0.149}, pasa: {value: 26.99}},
    {abertura: {value:0.105}, pasa: {value: 16.58}},
    {abertura: {value:0.074}, pasa: {value: 11.68}},
  ]};

  const porcentajes = [
    {
      value: 100, meta:
      {muestra: "556.0", "acumulado-pasante": [
        {malla: "35", porcentaje: 100 - 45.2 * 100 / 556, abertura: 0.5},
        {malla: "48", porcentaje: 100 - (80.1 + 45.2) * 100 / 556, abertura: 0.297},
        {malla: "65", porcentaje: 100 - 20 - (120.1 + 80.1 + 45.2) * 100 / 556, abertura: 0.21},
        {malla: "100", porcentaje: 100 - 20 - (104.6 + 120.1 + 80.1 + 45.2) * 100 / 556,
          abertura: 0.149},
        {malla: "150", porcentaje: 100 - 20  - (77.9 + 104.6 + 120.1 + 80.1 + 45.2) * 100 / 556, abertura: 0.105},
        {malla: "200", porcentaje: 100 - 20  - (43.8 + 77.9 + 104.6 + 120.1 + 80.1 + 45.2) * 100 / 556, abertura: 0.074},
        {malla: "-200", porcentaje: 100 - 20  - (84.3 + 43.8 + 77.9 + 104.6 + 120.1 + 80.1 + 45.2) * 100 / 556,
          abertura: 0}
      ]}
    },
    {
      value: 100, meta:
      {muestra: "585.6", "acumulado-pasante": [
        {malla: "35", porcentaje: 100 - 57.3 * 100 / 585.6, abertura: 0.5},
        {malla: "48", porcentaje: 100 - (89.5 + 57.3) * 100 / 585.6, abertura: 0.297},
        {malla: "65", porcentaje: 100 - (125.6 + 89.5 + 57.3) * 100 / 585.6, abertura: 0.21},
        {malla: "100", porcentaje: 100 - (100.5 + 125.6 + 89.5 + 57.3) * 100 / 585.6,
          abertura: 0.149},
        {malla: "150", porcentaje: 100 - (82.3 + 100.5 + 125.6 + 89.5 + 57.3) * 100 / 585.6, abertura: 0.105},
        {malla: "200", porcentaje: 100 - (45.8 + 82.3 + 100.5 + 125.6 + 89.5 + 57.3) * 100 / 585.6, abertura: 0.074},
        {malla: "-200", porcentaje: 100 - (84.6 + 45.8 + 82.3 + 100.5 + 125.6 + 89.5 + 57.3) * 100 / 585.6,
          abertura: 0}
      ]}
    },
  ];

  const seriesSaveMock = jest.fn();
  const seriesQueryMock = async () => porcentajes;
  const refsParamMock = async (queryRefs) => ({
    "banda-granulometrica-superior": paramSuperior,
    "banda-granulometrica-inferior": paramInferior,
  })[queryRefs];
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
    },
  });

  // assert
  expect(seriesSaveMock.mock.calls.length)
    .toEqual(1);
  expect(seriesSaveMock.mock.calls[0][0])
    .toEqual(1);

});
