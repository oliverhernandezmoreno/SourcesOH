const utilsAssertMock = (x) => {
  if (typeof x !== "undefined" && x !== null) {
    return x;
  }
  throw new Error("assert!");
};
const seriesQueryMock = jest.fn();
const seriesYieldMock = jest.fn();

const invoke = () => script({
  utils: {assert: utilsAssertMock},
  series: {
    query: seriesQueryMock,
    yield: seriesYieldMock,
  }
});

test("it raises an event for values in (0, 1]", async () => {
  // [value, expectation] pairs
  const tests = [
    [-1,  false],
    [0,   false],
    [0.1, true],
    [1,   true],
    [1.9, false],
    [2,   false],
    [3,   false],
  ];
  for (let [value, expected] of tests) {
    // setup
    seriesQueryMock.mockReturnValueOnce(Promise.resolve({value}));
    // invoke
    await invoke();
    // assert
    expect(seriesYieldMock).toHaveBeenLastCalledWith(expected);
  }
});
