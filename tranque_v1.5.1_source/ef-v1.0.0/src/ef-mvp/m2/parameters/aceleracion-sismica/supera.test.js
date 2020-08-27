
const utilsIsDefinedMock = (x) => typeof x !== "undefined";
const name = "testname"

test("script return 1 when value is upper the threshold", async () => {
  const values = [{value: 0.65, name: name + 4, data_source: {id: 4}}];
  const thresholds = [{
    canonical_name: name+4,
    active_thresholds: [{
      upper: 0.5,
    }],
    data_source: {id: 4}
  }];

  const seriesSaveMock = jest.fn();
  const seriesQueryAllMock = async () => values;
  const refsGetManyMock = async () => thresholds;
  const debug = (msg) => console.log("DEBUG:", msg);

  await script({
    refs: {
      getMany: refsGetManyMock,
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
    .toEqual(1);

});


test("script return 0 when value isn't upper the threshold", async () => {
  const values = [{value: 0.25, name: name+1, data_source: {id: 1}}];
  const thresholds = [
    {
      canonical_name: name+1,
      active_thresholds: [{upper: 0.3}],
      data_source: {id: 1}
    },
    {
      canonical_name: name+2,
      active_thresholds: [{
        upper: 0.3,
      }],
      data_source: {id: 2}
    },
    {
      canonical_name: name+3,
      active_thresholds: [{
        upper: 0.3,
      }],
      data_source: {id: 3}
    },
    {
      canonical_name: name+4,
      active_thresholds: [{
        upper: 0.5,
      }],
      data_source: {id: 4}
    },
    {
      canonical_name: name+5,
      active_thresholds: [{
        upper: 0.2,
      }],
      data_source: {id: 5}
    },
  ];

  const seriesSaveMock = jest.fn();
  const seriesQueryAllMock = async () => values;
  const refsGetManyMock = async () => thresholds;
  const debug = (msg) => console.log("DEBUG:", msg);

  await script({
    refs: {
      getMany: refsGetManyMock,
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
    .toEqual(0);

});


test("script return 0 when the threshold-upper or active_thresholds is not defined", async () => {
  const values = [
    {value: 0.25, name: name+1, data_source: {id: 1}},
    {value: 0.35, name: name+2, data_source: {id: 2}},  // >
    {value: 0.15, name: name+3, data_source: {id: 3}},
    {value: 0.65, name: name+4, data_source: {id: 4}},  // >
    {value: 0.25, name: name+5, data_source: {id: 5}},
  ];
  const thresholds = [
    {
      canonical_name: name+1,
      active_thresholds: [],
      data_source: {id: 1}
    },
    {
      canonical_name: name+2,
      active_thresholds: [],
      data_source: {id: 2}
    },
    {
      canonical_name: name+3,
      data_source: {id: 3}
    },
    {
      canonical_name: name+4,
      active_thresholds: [],
      data_source: {id: 4}
    },
    {
      canonical_name: name+5,
      active_thresholds: [],
      data_source: {id: 5}
    },
    {
      canonical_name: name+6,
      active_thresholds: [],
      data_source: {id: 6}
    },
  ];

  const seriesSaveMock = jest.fn();
  const seriesQueryAllMock = async () => values;
  const refsGetManyMock = async () => thresholds;
  const debug = (msg) => console.log("DEBUG:", msg);

  await script({
    refs: {
      getMany: refsGetManyMock,
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
    .toEqual(0);

});

test("script return 1 when the threshold-upper is correctly", async () => {
  const values = [
    {value: 0.25, name: name+1, data_source: {id: 1}},  // >
    {value: 0.35, name: name+2, data_source: {id: 2}},  // >
    {value: 0.15, name: name+3, data_source: {id: 3}},
    {value: 0.65, name: name+4, data_source: {id: 4}},  // >
    {value: 0.25, name: name+5, data_source: {id: 5}},
  ];
  const thresholds = [
    {
      canonical_name: name+1,
      active_thresholds: [{upper: 0.2}],
      data_source: {id: 1}
    },
    {
      canonical_name: name+2,
      active_thresholds: [{
        upper: 0.3,
      }],
      data_source: {id: 2}
    },
    {
      canonical_name: name+3,
      active_thresholds: [{
        upper: 0.3,
      }],
      data_source: {id: 3}
    },
    {
      canonical_name: name+4,
      active_thresholds: [{
        upper: 0.5,
      }],
      data_source: {id: 4}
    },
    {
      canonical_name: name+5,
      active_thresholds: [{
        upper: 0.3,
      }],
      data_source: {id: 5}
    },
  ];

  const seriesSaveMock = jest.fn();
  const seriesQueryAllMock = async () => values;
  const refsGetManyMock = async () => thresholds;
  const debug = (msg) => console.log("DEBUG:", msg);

  await script({
    refs: {
      getMany: refsGetManyMock,
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
    .toEqual(1);

});
