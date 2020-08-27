const utilsIsDefinedMock = (x) => typeof x !== "undefined";
const refsGetOneMock = jest.fn();
const seriesQueryMock = jest.fn();
const seriesYieldMock = jest.fn();

const invoke = () => script({
  utils: {isDefined: utilsIsDefinedMock},
  refs: {getOne: refsGetOneMock},
  series: {
    query: seriesQueryMock,
    yield: seriesYieldMock,
  },
});

test("raises an event on values greater than the threshold", async () => {
  // setup
  refsGetOneMock.mockReturnValueOnce(Promise.resolve(
    {
      active_thresholds: [
        {upper: "2.1000"},
        {upper: "1.5000"},
      ]
    }
  ));
  seriesQueryMock.mockReturnValueOnce(Promise.resolve(
    {value: 2}
  ));
  // invoke
  await invoke();
  // assert
  expect(seriesYieldMock).toHaveBeenCalledWith(true, {meta: {value: 2, threshold: 1.5}});
});

test("doesn't raise an event on values equal to the threshold", async () => {
  // setup
  refsGetOneMock.mockReturnValueOnce(Promise.resolve(
    {
      active_thresholds: [
        {upper: "2.1000"},
        {upper: "2.0000"},
      ]
    }
  ));
  seriesQueryMock.mockReturnValueOnce(Promise.resolve(
    {value: 2}
  ));
  // invoke
  await invoke();
  // assert
  expect(seriesYieldMock).toHaveBeenCalledWith(false, {meta: {value: 2, threshold: 2}});
});

test("doesn't raise an event when the threshold is not defined", async () => {
  // setup
  refsGetOneMock.mockReturnValueOnce(Promise.resolve(
    {active_thresholds: []}
  ));
  seriesQueryMock.mockReturnValueOnce(Promise.resolve(
    {value: 2}
  ));
  // invoke
  await invoke();
  // assert
  expect(seriesYieldMock).toHaveBeenCalledWith(false, {meta: {value: 2, threshold: undefined}});
});
