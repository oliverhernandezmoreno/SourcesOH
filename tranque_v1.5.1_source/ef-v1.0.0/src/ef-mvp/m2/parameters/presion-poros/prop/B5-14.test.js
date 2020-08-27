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

test("raises an event if there's an input event on the current location and another location", async () => {
  // setup
  seriesQueryMock.mockReturnValueOnce(Promise.resolve({meta: {
    vars: [
      ctxRootRefMock,
      {
        canonical_name: "that-variable",
        data_source: {
          id: "that-source",
          groups: ["baz", "omg", "ubicacion-ipsum"]
        }
      },
      {
        canonical_name: "other-variable",
        data_source: {
          id: "other-source",
          groups: ["foo", "baz", "ubicacion-dolor"]
        }
      }
    ],
    heads: [
      {name: "this-variable", value: 1},
      {name: "other-variable", value: 0},
      {name: "that-variable", value: 1}
    ]
  }}));
  // invoke
  await invoke();
  // assert
  expect(seriesYieldMock).toHaveBeenCalledWith(true, {meta: {others: ["that-variable"]}});
});

test("doesn't raise an event if there's no input event on another location", async () => {
  // setup
  seriesQueryMock.mockReturnValueOnce(Promise.resolve({meta: {
    vars: [
      ctxRootRefMock,
      {
        canonical_name: "that-variable",
        data_source: {
          id: "that-source",
          groups: ["baz", "omg", "ubicacion-ipsum"]
        }
      },
      {
        canonical_name: "other-variable",
        data_source: {
          id: "other-source",
          groups: ["foo", "baz", "ubicacion-dolor"]
        }
      }
    ],
    heads: [
      {name: "this-variable", value: 1},
      {name: "other-variable", value: 0},
      {name: "that-variable", value: 0}
    ]
  }}));
  // invoke
  await invoke();
  // assert
  expect(seriesYieldMock).toHaveBeenCalledWith(false, {meta: {others: []}});
});

test("doesn't raise an event if there's no input event", async () => {
  // setup
  seriesQueryMock.mockReturnValueOnce(Promise.resolve({meta: {
    vars: [
      ctxRootRefMock,
      {
        canonical_name: "that-variable",
        data_source: {
          id: "that-source",
          groups: ["baz", "omg", "ubicacion-ipsum"]
        }
      },
      {
        canonical_name: "other-variable",
        data_source: {
          id: "other-source",
          groups: ["foo", "baz", "ubicacion-dolor"]
        }
      }
    ],
    heads: [
      {name: "this-variable", value: 0},
      {name: "other-variable", value: 1},
      {name: "that-variable", value: 1}
    ]
  }}));
  // invoke
  await invoke();
  // assert
  expect(seriesYieldMock).toHaveBeenCalledWith(false, {meta: {others: []}});
});
