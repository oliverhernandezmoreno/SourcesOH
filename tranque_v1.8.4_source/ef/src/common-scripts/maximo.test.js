const ctxRootRefMock = "this-script";

const utilsIsDefinedMock = (x) => typeof x !== "undefined";

test("script computes maximo value in a series queryAll", async () => {
  const expected = 6.7;
  const seriesQueryAllMock = async () => [
    {value: 4.0},
    {value: 4.4},
    {value: 6.5},
    {value: 6.2},
    {value: 6.5},
    {value: 6.7},
    {value: 6.3},
    {value: 6.4},
  ];
  const seriesSaveMock = jest.fn();
  await script({
    ctx: {rootRef: ctxRootRefMock},
    series: {
      queryAll: seriesQueryAllMock,
      yield: seriesSaveMock,
    },
    utils: {isDefined: utilsIsDefinedMock},
  });
  // assert
  expect(seriesSaveMock.mock.calls.length)
    .toEqual(1);
  expect(seriesSaveMock.mock.calls[0][0])
    .toEqual(expected);
});
