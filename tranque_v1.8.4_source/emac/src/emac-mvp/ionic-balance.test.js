test("script computes ionic balances", async () => {
  const seriesQueryMock = async () => [
    {value: 1},
    {value: 2},
    {value: 3},
    {value: 4},
    {value: 5},
    {value: 6},
    {value: 7},
    {value: 8},
  ];
  const seriesSaveMock = jest.fn();
  await script({series: {query: seriesQueryMock, save: seriesSaveMock}});
  // assert
  expect(seriesSaveMock.mock.calls.length).toEqual(1);
  expect(seriesSaveMock.mock.calls[0][0]).not.toBeNaN();
});

test("script fails when any variable is missing", async () => {
  const seriesQueryMock = async () => [
    {value: 1},
    {value: 2},
    {value: 3},
    {value: 4},
    {value: 5},
    {value: 6},
    undefined,
    {value: 8},
  ];
  const seriesSaveMock = jest.fn();
  try {
    await script({series: {query: seriesQueryMock, save: seriesSaveMock}});
  } catch (e) {}
  // assert
  expect(seriesSaveMock.mock.calls.length).toEqual(0);
});
