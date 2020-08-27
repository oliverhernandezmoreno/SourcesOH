const utilsAssertMock = (x) => x;
const refsGetOneMock = jest.fn();
const seriesQueryMock = jest.fn();
const seriesYieldMock = jest.fn();

const invoke = () => script({
  utils: {assert: utilsAssertMock},
  refs: {getOne: refsGetOneMock},
  series: {
    query: seriesQueryMock,
    yield: seriesYieldMock
  }
});

test("raises event if the value is greater than the threshold", async () => {
  // setup
  seriesQueryMock.mockReturnValueOnce(Promise.resolve({value: 11.01}));
  refsGetOneMock.mockReturnValueOnce(Promise.resolve({active_thresholds: [
    {upper: "11.5000"},
    {upper: "13.0000", kind: "cota-instalacion"},
    {upper: "11.0000", kind: "cota-instalacion"},
  ]}));
  // invoke
  await invoke();
  // assert
  expect(seriesYieldMock).toHaveBeenCalledWith(true, {meta: {value: 11.01, threshold: 11}});
});

test("doesn't raise an event if the value is equal to the threshold", async () => {
  // setup
  seriesQueryMock.mockReturnValueOnce(Promise.resolve({value: 11}));
  refsGetOneMock.mockReturnValueOnce(Promise.resolve({active_thresholds: [
    {upper: "11.0000", kind: "cota-instalacion"},
  ]}));
  // invoke
  await invoke();
  // assert
  expect(seriesYieldMock).toHaveBeenCalledWith(false, {meta: {value: 11, threshold: 11}});
});

test("doesn't raise an event if the value is less than the threshold", async () => {
  // setup
  seriesQueryMock.mockReturnValueOnce(Promise.resolve({value: 10.99}));
  refsGetOneMock.mockReturnValueOnce(Promise.resolve({active_thresholds: [
    {upper: "11.0000", kind: "cota-instalacion"},
  ]}));
  // invoke
  await invoke();
  // assert
  expect(seriesYieldMock).toHaveBeenCalledWith(false, {meta: {value: 10.99, threshold: 11}});
});
