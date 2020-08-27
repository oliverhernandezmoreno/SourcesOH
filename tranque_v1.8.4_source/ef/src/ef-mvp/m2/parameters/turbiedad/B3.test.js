const utilsIsDefinedMock = (x) => typeof x !== "undefined";
const seriesQueryMock = jest.fn();
const seriesYieldMock = jest.fn();

const invoke = () => script({
  utils: {isDefined: utilsIsDefinedMock},
  series: {
    query: seriesQueryMock,
    yield: seriesYieldMock,
  },
});

test("raises an event when both inputs are raised", async () => {
  // setup
  seriesQueryMock
    .mockReturnValueOnce(Promise.resolve({value: 1}))
    .mockReturnValueOnce(Promise.resolve({value: 1.1}));
  // invoke
  await invoke();
  // assert
  expect(seriesYieldMock).toHaveBeenCalledWith(true, {meta: {B1: {value: 1}, B2: {value: 1.1}}});
});

test("doesn't raise an event if any of the inputs is not raised", async () => {
  // setup
  seriesQueryMock
    .mockReturnValueOnce(Promise.resolve({value: 1}))
    .mockReturnValueOnce(Promise.resolve({value: 0}));
  // invoke
  await invoke();
  // assert
  expect(seriesYieldMock).toHaveBeenCalledWith(false, {meta: {B1: {value: 1}, B2: {value: 0}}});
});

test("doesn't raise an event if any of the inputs is undefined", async () => {
  // setup
  seriesQueryMock
    .mockReturnValueOnce(Promise.resolve(undefined))
    .mockReturnValueOnce(Promise.resolve({value: 1}));
  // invoke
  await invoke();
  // assert
  expect(seriesYieldMock).toHaveBeenCalledWith(false, {meta: {B1: undefined, B2: {value: 1}}});
});
