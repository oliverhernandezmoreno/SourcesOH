const ctxRootRefMock = {
  canonical_name: "this-variable",
  data_source: {
    id: "this-source",
    groups: ["foo", "bar", "ubicacion-lorem"]
  }
};
const utilsIsDefinedMock = (x) => typeof x !== "undefined" && x !== null;
const utilsIsUndefinedMock = (x) => !utilsIsDefinedMock(x);
const utilsAssertMock = (x) => {
  if (utilsIsUndefinedMock(x)) {
    throw new Error("assert!");
  }
  return x;
};
const utilsDebugMock = (t) => console.log("DEBUG:", t);
const seriesQueryMock = jest.fn();
const seriesYieldMock = jest.fn();

const invoke = () => script({
  ctx: {rootRef: ctxRootRefMock},
  utils: {
    isDefined: utilsIsDefinedMock,
    isUndefined: utilsIsUndefinedMock,
    assert: utilsAssertMock,
    debug: utilsDebugMock
  },
  series: {
    query: seriesQueryMock,
    yield: seriesYieldMock
  }
});

test("raises an event on the prescribed conditions", async () => {
  // setup
  seriesQueryMock
    .mockReturnValueOnce(Promise.resolve({meta: {
      vars: [
        ctxRootRefMock,
        {
          canonical_name: "that-variable",
          data_source: {
            id: "that-source",
            groups: ["fooooo", "ubicacion-ipsum"]
          }
        }
      ],
      heads: [
        {name: "this-variable", value: 1, meta: {valid: true}},
        {name: "that-variable", value: 1}
      ]
    }}));
  // invoke
  await invoke();
  // assert
  expect(seriesYieldMock).toHaveBeenCalledWith(true, {meta: {others: ["that-variable"]}});
});

test("doesn't raise an event when the value is not validated", async () => {
  // setup
  seriesQueryMock
    .mockReturnValueOnce(Promise.resolve({meta: {
      vars: [
        ctxRootRefMock,
        {
          canonical_name: "that-variable",
          data_source: {
            id: "that-source",
            groups: ["fooooo", "ubicacion-ipsum"]
          }
        }
      ],
      heads: [
        {name: "this-variable", value: 1, meta: {valid: false}},
        {name: "that-variable", value: 1}
      ]
    }}));
  // invoke
  await invoke();
  // assert
  expect(seriesYieldMock).toHaveBeenCalledWith(false, {meta: {others: []}});
});

test("doesn't raise an event when no other location is found", async () => {
  // setup
  seriesQueryMock
    .mockReturnValueOnce(Promise.resolve({meta: {
      vars: [
        ctxRootRefMock,
        {
          canonical_name: "that-variable",
          data_source: {
            id: "that-source",
            groups: ["fooooo", "ubicacion-lorem"]
          }
        }
      ],
      heads: [
        {name: "this-variable", value: 1, meta: {valid: true}},
        {name: "that-variable", value: 1}
      ]
    }}));
  // invoke
  await invoke();
  // assert
  expect(seriesYieldMock).toHaveBeenCalledWith(false, {meta: {others: []}});
});
