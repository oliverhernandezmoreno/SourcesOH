const utilsIsDefinedMock = (x) => typeof x !== "undefined";


test("script totales", async () => {
  const totals = [
    {
      value: 556.0, meta:
      {muestra: "556.0", parcial: [
        {malla: "35", porcentaje: 45.2 * 100 / 556, abertura: 0.5},
        {malla: "48", porcentaje: 80.1 * 100 / 556, abertura: 0.297},
        {malla: "65", porcentaje: 120.1 * 100 / 556, abertura: 0.21},
        {malla: "100", porcentaje: 104.6 * 100 / 556, abertura: 0.149},
        {malla: "150", porcentaje: 77.9 * 100 / 556, abertura: 0.105},
        {malla: "200", porcentaje: 43.8 * 100 / 556, abertura: 0.074},
        {malla: "-200", porcentaje: 84.3 * 100 / 556}
      ]}
    },
    {
      value: 585.6, meta:
      {muestra: "585.6", parcial: [
        {malla: "35", porcentaje: 57.3 * 100 / 585.6, abertura: 0.5},
        {malla: "48", porcentaje: 89.5 * 100 / 585.6, abertura: 0.297},
        {malla: "65", porcentaje: 125.6 * 100 / 585.6, abertura: 0.21},
        {malla: "100", porcentaje: 100.5 * 100 / 585.6, abertura: 0.149},
        {malla: "150", porcentaje: 82.3 * 100 / 585.6, abertura: 0.105},
        {malla: "200", porcentaje: 45.8 * 100 / 585.6, abertura: 0.074},
        {malla: "-200", porcentaje: 84.6 * 100 / 585.6}
      ]}
    },
  ];

  const expected = [
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
          abertura: undefined}
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
          abertura: undefined}
      ]}
    },
  ];



  const seriesSaveMock = jest.fn();
  const seriesQueryMock = async (query) => totals;
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
    .toEqual(2);
  expect(seriesSaveMock.mock.calls[0][0])
    .toEqual(expected[0].value);
  expect(seriesSaveMock.mock.calls[1][0])
    .toEqual(expected[1].value);


  expect(seriesSaveMock.mock.calls[0][1].meta.muestra)
    .toEqual(expected[0].meta.muestra);
  expect(seriesSaveMock.mock.calls[1][1].meta.muestra)
    .toEqual(expected[1].meta.muestra);

  const received = seriesSaveMock.mock.calls[0][1].meta["acumulado-pasante"];
  const acumulado = expected[0].meta["acumulado-pasante"];

  acumulado.forEach((item) => {
    const searched = received.find((r) => r.malla === item.malla);
    if (searched) {
      expect(item.porcentaje).toBeCloseTo(searched.porcentaje, 3);
    }
  });

  const received2 = seriesSaveMock.mock.calls[1][1].meta["acumulado-pasante"];
  const acumulado2 = expected[1].meta["acumulado-pasante"];

  acumulado2.forEach((item) => {
    const searched = received2.find((r) => r.malla === item.malla);
    if (searched) {
      expect(item.porcentaje).toBeCloseTo(searched.porcentaje, 3);
    }
  });


});
