const ctxRootRefMock = "this-script";

const utilsIsDefinedMock = (x) => typeof x !== "undefined";

test("script return 1 when compute process al menos un evento in a series queryAll. events.length = 1", async () => {
  const expected = 1;
  const seriesQueryAllMock = async () => [
    {value: 4.0}
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

test("script return 1 when compute process al menos un evento in a series queryAll. events.length = 8", async () => {
  const expected = 1;
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
