const ctxRootRefMock = "this-script";

const utilsIsDefinedMock = (x) => typeof x !== "undefined";

const seriesQueryMock = async ({head: name}) => ({
  [ctxRootRefMock]: {value: 7},
  "*.exclusions": {meta: {excludedTemplates: ["foo", "bar", "baz"]}},
})[name];

const makeRefsGetManyMock = (templateNames) => async (pattern) => templateNames.map((name) => ({
  canonical_name: `target.${name}`,
  template_name: name,
}));

test("script yields n + previous when n values are above 0.5", async () => {
  const seriesQueryAllMock = async () => [
    {value: 0.49, name: "target.lorem"},
    {value: 0.5, name: "target.ipsum"},
    {value: 0, name: "target.dolor"},
    {value: 1, name: "target.sit"},      // strictly above 0.5
    {value: 0.501, name: "target.amet"}, // strictly above 0.5
  ];
  const seriesYieldMock = jest.fn();
  await script({
    ctx: {rootRef: ctxRootRefMock},
    refs: {getMany: makeRefsGetManyMock(["lorem", "ipsum", "dolor", "sit", "amet"])},
    series: {
      queryAll: seriesQueryAllMock,
      query: seriesQueryMock,
      yield: seriesYieldMock,
    },
    utils: {isDefined: utilsIsDefinedMock},
  });
  // assert
  expect(seriesYieldMock.mock.calls.length)
    .toEqual(1);
  expect(seriesYieldMock.mock.calls[0][0])
    .toEqual(2 + 7);
});

test("script yields 0 when no value is above 0.5", async () => {
  const seriesQueryAllMock = async () => [
    {value: 0.49, name: "target.lorem"},
    {value: 0, name: "target.ipsum"},
  ];
  const seriesYieldMock = jest.fn();
  await script({
    ctx: {rootRef: ctxRootRefMock},
    refs: {getMany: makeRefsGetManyMock(["lorem", "ipsum"])},
    series: {
      queryAll: seriesQueryAllMock,
      query: seriesQueryMock,
      yield: seriesYieldMock,
    },
    utils: {isDefined: utilsIsDefinedMock},
  });
  // assert
  expect(seriesYieldMock.mock.calls.length)
    .toEqual(1);
  expect(seriesYieldMock.mock.calls[0][0])
    .toEqual(0);
});

test("script excludes variables that are excluded in the previous script", async () => {
  const seriesQueryAllMock = async () => [
    {value: 0.51, name: "target.foo"},   // to be excluded
    {value: 0.51, name: "target.lorem"},
    {value: 0.49, name: "target.ipsum"},
  ];
  const seriesYieldMock = jest.fn();
  await script({
    ctx: {rootRef: ctxRootRefMock},
    refs: {getMany: makeRefsGetManyMock(["foo", "lorem", "ipsum"])},
    series: {
      queryAll: seriesQueryAllMock,
      query: seriesQueryMock,
      yield: seriesYieldMock,
    },
    utils: {isDefined: utilsIsDefinedMock},
  });
  // assert
  expect(seriesYieldMock.mock.calls.length)
    .toEqual(1);
  expect(seriesYieldMock.mock.calls[0][0])
    .toEqual(1 + 7);
});
