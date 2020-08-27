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
            id: "that-source"
          }
        }
      ],
      heads: [
        {name: "this-variable", value: 1},
        {name: "that-variable", value: 1}
      ]
    }}))
    .mockReturnValueOnce(Promise.resolve({meta: {
      vars: [
        ctxRootRefMock,
        {
          canonical_name: "that-other-variable",
          data_source: {
            id: "that-other-source",
            groups: ["foo", "baz", "ubicacion-dolor"]
          }
        }
      ],
      heads: [
        {name: "this-variable", value: 0},
        {name: "that-other-variable", value: 1},
      ]
    }}));
  // invoke
  await invoke();
  // assert
  expect(seriesYieldMock).toHaveBeenCalledWith(true, {meta: {others: ["that-variable", "that-other-variable"]}});
});

test("doesn't raise an event if no other event is raised on another location", async () => {
  // setup
  seriesQueryMock
    .mockReturnValueOnce(Promise.resolve({meta: {
      vars: [
        ctxRootRefMock,
        {
          canonical_name: "that-variable",
          data_source: {
            id: "that-source"
          }
        }
      ],
      heads: [
        {name: "this-variable", value: 1},
        {name: "that-variable", value: 1}
      ]
    }}))
    .mockReturnValueOnce(Promise.resolve({meta: {
      vars: [
        ctxRootRefMock,
        {
          canonical_name: "that-other-variable",
          data_source: {
            id: "that-other-source",
            groups: ["foo", "baz", "ubicacion-dolor"]
          }
        }
      ],
      heads: [
        {name: "this-variable", value: 0},
        {name: "that-other-variable", value: 0},
      ]
    }}));
  // invoke
  await invoke();
  // assert
  expect(seriesYieldMock).toHaveBeenCalledWith(false, {meta: {others: ["that-variable"]}});
});

test("doesn't raise an event if no other event is raised on the same redundancy group", async () => {
  // setup
  seriesQueryMock
    .mockReturnValueOnce(Promise.resolve({meta: {
      vars: [
        ctxRootRefMock,
        {
          canonical_name: "that-variable",
          data_source: {
            id: "that-source"
          }
        }
      ],
      heads: [
        {name: "this-variable", value: 1},
        {name: "that-variable", value: 0}
      ]
    }}))
    .mockReturnValueOnce(Promise.resolve({meta: {
      vars: [
        ctxRootRefMock,
        {
          canonical_name: "that-other-variable",
          data_source: {
            id: "that-other-source",
            groups: ["foo", "baz", "ubicacion-dolor"]
          }
        }
      ],
      heads: [
        {name: "this-variable", value: 0},
        {name: "that-other-variable", value: 1},
      ]
    }}));
  // invoke
  await invoke();
  // assert
  expect(seriesYieldMock).toHaveBeenCalledWith(false, {meta: {others: []}});
});
