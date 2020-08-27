const utilsIsDefinedMock = (x) => typeof x !== "undefined";
const utilsAssertMock = (x) => {
  if (!utilsIsDefinedMock(x)) {
    throw new Error("assert!");
  }
  return x;
};
const utilsMinutesAgoMock = jest.fn();
const refsGetOneMock = jest.fn();
const seriesQueryMock = jest.fn();

const invoke = (m) => script({
  utils: {
    isDefined: utilsIsDefinedMock,
    assert: utilsAssertMock,
    minutesAgo: utilsMinutesAgoMock,
  },
  refs: {getOne: refsGetOneMock},
  series: {
    query: seriesQueryMock,
    yield: m,
  }
});

test("correctly gives the std value for a normally-defined window", async () => {
  // setup
  refsGetOneMock.mockReturnValueOnce(Promise.resolve({
    active_thresholds: [
      {kind: "ventana-movil", upper: "3.000"},
    ]
  }));
  seriesQueryMock
    .mockReturnValueOnce(Promise.resolve({}))
    .mockReturnValueOnce(Promise.resolve([
      {value: 1},
      {value: 2},
      {value: 3},
      {value: 4},
    ]));
  // invoke
  const seriesYieldMock = jest.fn();
  await invoke(seriesYieldMock);
  // assert
  const argument = seriesYieldMock.mock.calls[0][0];
  expect(argument).toBeCloseTo(1.29, 1);
});

test("doesn't yield values for insufficient data in the window", async () => {
  // setup
  refsGetOneMock.mockReturnValueOnce(Promise.resolve({
    active_thresholds: [
      {kind: "ventana-movil", upper: "3.000"},
    ]
  }));
  seriesQueryMock
    .mockReturnValueOnce(Promise.resolve({}))
    .mockReturnValueOnce(Promise.resolve([
      {value: 1},
      {value: 2},
    ]));
  // invoke
  const seriesYieldMock = jest.fn();
  await invoke(seriesYieldMock);
  // assert
  expect(seriesYieldMock).not.toHaveBeenCalled();
});
