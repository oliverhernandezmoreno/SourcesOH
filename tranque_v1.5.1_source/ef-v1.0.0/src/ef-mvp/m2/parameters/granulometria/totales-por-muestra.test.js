const utilsIsDefinedMock = (x) => typeof x !== "undefined";


test("script totales", async () => {
  const lastDay = {value: 10, "@timestamp": "2018-01-28T00:00:00+00:00"};
  const slice = [
    {
      value: 45.2, meta:
      {muestra: "556.0", malla: "35", abertura: 0.5}
    },
    {
      value: 80.1, meta:
      {muestra: "556.0", malla: "48", abertura: 0.297}
    },
    {
      value: 120.1, meta:
      {muestra: "556.0", malla: "65", abertura: 0.21}
    },
    {
      value: 104.6, meta:
      {muestra: "556.0", malla: "100", abertura: 0.149}
    },
    {
      value: 77.9, meta:
      {muestra: "556.0", malla: "150", abertura: 0.105}
    },
    {
      value: 43.8, meta:
      {muestra: "556.0", malla: "200", abertura: 0.074}
    },
    {
      value: 84.3, meta:
      {muestra: "556.0", malla: "-200"}
    },
    {
      value: 57.3, meta:
      {muestra: "585.6", malla: "35", abertura: 0.5}
    },
    {
      value: 89.5, meta:
      {muestra: "585.6", malla: "48", abertura: 0.297}
    },
    {
      value: 125.6, meta:
      {muestra: "585.6", malla: "65", abertura: 0.21}
    },
    {
      value: 100.5, meta:
      {muestra: "585.6", malla: "100", abertura: 0.149}
    },
    {
      value: 82.3, meta:
      {muestra: "585.6", malla: "150", abertura: 0.105}
    },
    {
      value: 45.8, meta:
      {muestra: "585.6", malla: "200", abertura: 0.074}
    },
    {
      value: 84.6, meta:
      {muestra: "585.6", malla: "-200"}
    },
  ];

  const totals = {"556.0":
    [45.2,
      80.1,
      120.1,
      104.6,
      77.9,
      43.8,
      84.3].reduce((a, b) => a + b, 0),
    "585.6": [57.3,
      89.5,
      125.6,
      100.5,
      82.3,
      45.8,
      84.6].reduce((a, b) => a + b, 0)
  };

  const seriesSaveMock = jest.fn();
  const seriesQueryMock = async (query) => {
    if (query.head !== undefined)
      return lastDay;
    else
      return slice;
  };
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
    .toEqual(totals["556.0"]);
  expect(seriesSaveMock.mock.calls[1][0])
    .toEqual(totals["585.6"]);

});
