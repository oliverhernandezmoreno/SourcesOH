const utilsIsDefinedMock = (x) => typeof x !== "undefined";

const TONELAJE_YES = + true;  // 1
const TONELAJE_NO  = + false; // 0

test("script return true when " +
  "Si el Plan de depositación menos error es mayor que el tonelaje actual se activa", async () => {
  const expected = Boolean(TONELAJE_YES);
  const planDepositacionProyecto = {
    value: {
      curve:[
        {date: "2016-03-01", value: 100000},
        {date: "2016-06-01", value: 105500},
        {date: "2016-09-01", value: 111000},
        {date: "2016-12-01", value: 116500},
        {date: "2017-03-01", value: 122000},
        {date: "2017-06-01", value: 127500},
        {date: "2017-09-01", value: 133000},
        {date: "2017-12-01", value: 138500},
        {date: "2018-03-01", value: 144000},
        {date: "2018-06-01", value: 149500},
        {date: "2018-09-01", value: 155500},
        {date: "2018-12-01", value: 160500},
        {date: "2019-03-01", value: 166000},
        {date: "2019-06-01", value: 171500},
        {date: "2019-09-01", value: 177000},
        {date: "2019-12-01", value: 182500},
        {date: "2020-03-01", value: 188000},
        {date: "2020-06-01", value: 193500},
      ]
    }
  };
  const errorPermitido = {value: 4500};
  const tonelaje = {
    value: 165500,
    '@timestamp': "2019-06-02T00:00:00"
  };

  const seriesSaveMock = jest.fn();
  const seriesQueryMock = async () => tonelaje;
  const refParamMock = async () => ({
    "plan-depositacion-proyecto": planDepositacionProyecto,
    "error-permitido-tonelaje-plan-depositacion-proyecto": errorPermitido,
  });
  const debug = (msg) => console.log("DEBUG:", msg);

  await script({
    refs: {
      param: refParamMock,
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
    .toEqual(expected);
});

test("script return true when " +
  "Si el Plan de depositación menos error es mayor que el tonelaje actual se activa", async () => {
  const expected = Boolean(TONELAJE_NO);
  const planDepositacionProyecto = {
    value: {
      curve:[
        {date: "2016-03-01", value: 100000},
        {date: "2016-06-01", value: 105500},
        {date: "2016-09-01", value: 111000},
        {date: "2016-12-01", value: 116500},
        {date: "2017-03-01", value: 122000},
        {date: "2017-06-01", value: 127500},
        {date: "2017-09-01", value: 133000},
        {date: "2017-12-01", value: 138500},
        {date: "2018-03-01", value: 144000},
        {date: "2018-06-01", value: 149500},
        {date: "2018-09-01", value: 155500},
        {date: "2018-12-01", value: 160500},
        {date: "2019-03-01", value: 166000},
        {date: "2019-06-01", value: 171500},
        {date: "2019-09-01", value: 177000},
        {date: "2019-12-01", value: 182500},
        {date: "2020-03-01", value: 188000},
        {date: "2020-06-01", value: 193500},
      ]
    }
  };
  const errorPermitido = {value: 4500};
  const tonelaje = {
    value: 195000,
    '@timestamp': "2020-06-02T00:00:00"
  };

  const seriesSaveMock = jest.fn();
  const seriesQueryMock = async () => tonelaje;
  const refParamMock = async () => ({
    "plan-depositacion-proyecto": planDepositacionProyecto,
    "error-permitido-tonelaje-plan-depositacion-proyecto": errorPermitido,
  });
  const debug = (msg) => console.log("DEBUG:", msg);

  await script({
    refs: {
      param: refParamMock,
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
    .toEqual(expected);
});
