const ctxRootRefMock = {data_source: {id: "this-source"}};
const utilsIsDefinedMock = (x) => typeof x !== "undefined" && x !== null;
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
  ctx: {rootRef: ctxRootRefMock},
  utils: {
    isDefined: utilsIsDefinedMock,
    assert: utilsAssertMock
  },
  refs: {getOne: refsGetOneMock},
  series: {
    query: seriesQueryMock,
    yield: seriesYieldMock
  }
});

test("saves the step function and the appropriate metadata", async () => {
  // setup
  refsGetOneMock
    .mockReturnValueOnce(Promise.resolve({active_thresholds: [
      {kind: null, upper: "16.000"},
      {kind: null, upper: "17.500"},
      {kind: null, upper: "19.000"},
    ]}));
  seriesQueryMock
    .mockReturnValueOnce(Promise.resolve({value: 18}))
    .mockReturnValueOnce(Promise.resolve())
    .mockReturnValueOnce(Promise.resolve({meta: {
      vars: [
        {data_source: {id: "this-source"}, canonical_name: "this-variable"},
        {data_source: {id: "that-source"}, canonical_name: "that-variable"},
        {data_source: {id: "that-other-source"}, canonical_name: "that-other-variable"},
      ]
    }}));
  // invoke
  await invoke();
  // assert
  expect(seriesYieldMock).toHaveBeenCalledWith(true, {meta: {
    value: 18,
    threshold: 16,
    valid: false,
    redundant: ["that-source", "that-other-source"]
  }});
});
