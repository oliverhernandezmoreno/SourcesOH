const utilsIsDefinedMock = (x) => typeof x !== "undefined" && x !== null;
const utilsIsUndefinedMock = (x) => !utilsIsDefinedMock(x);
const utilsAssertMock = (x) => {
  if (!utilsIsDefinedMock(x)) {
    throw new Error("assert!");
  }
  return x;
};
const refsGetOneMock = jest.fn();
const seriesQueryMock = jest.fn();
const seriesYieldMock = jest.fn();

const invoke = () => script({
  utils: {
    isDefined: utilsIsDefinedMock,
    isUndefined: utilsIsUndefinedMock,
    assert: utilsAssertMock,
  },
  refs: {getOne: refsGetOneMock},
  series: {
    query: seriesQueryMock,
    yield: seriesYieldMock,
  }
});

test("raises an event on manual input", async () => {
  // setup
  seriesQueryMock.mockReturnValueOnce(Promise.resolve({value: 1}));
  // invoke
  await invoke();
  // assert
  expect(seriesYieldMock).toHaveBeenCalledWith(true, {meta: {manual: true}});
});

test("raises an event on the analytical condition", async () => {
  // setup
  seriesQueryMock.mockReturnValueOnce(Promise.resolve(undefined));
  refsGetOneMock.mockReturnValueOnce(Promise.resolve({
    active_thresholds: [
      {kind: "coeficiente-variacion-linea-base", upper: "3.30000"},
      {kind: "porcentaje-variacion", upper: "0.01000"},
    ]
  }));
  seriesQueryMock.mockReturnValueOnce(Promise.resolve([{value: 10}, {value: 34}]));
  // invoke
  await invoke();
  // assert
  expect(seriesYieldMock)
    .toHaveBeenCalledWith(true, {meta: {manual: false, media: 10, std: 34, cvlb: 3.3, alfa: 0.01}});
});

test("doesn't raise an event when the computed coefficient is low enough", async () => {
  // setup
  seriesQueryMock.mockReturnValueOnce(Promise.resolve(undefined));
  refsGetOneMock.mockReturnValueOnce(Promise.resolve({
    active_thresholds: [
      {kind: "coeficiente-variacion-linea-base", upper: "3.30000"},
      {kind: "porcentaje-variacion", upper: "0.01000"},
    ]
  }));
  seriesQueryMock.mockReturnValueOnce(Promise.resolve([{value: 10}, {value: 33}]));
  // invoke
  await invoke();
  // assert
  expect(seriesYieldMock)
    .toHaveBeenCalledWith(false, {meta: {manual: false, media: 10, std: 33, cvlb: 3.3, alfa: 0.01}});
});
