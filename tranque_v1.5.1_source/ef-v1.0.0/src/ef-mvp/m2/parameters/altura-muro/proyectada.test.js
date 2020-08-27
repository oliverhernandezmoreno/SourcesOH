const utilsIsUndefined = (x) => typeof x === "undefined";

const utilsIsDefined = (x) => !utilsIsUndefined(x);

const ctxRootRef = {
  data_source: {
    groups: [
      "group-1",
      "group-2"
    ]
  }
};

const mocks = {
  utils: {
    debug: (msg) => console.log(msg),
    isUndefined: utilsIsUndefined,
    isDefined: utilsIsDefined,
  },
  ctx: {rootRef: ctxRootRef},
};

test("proyected height for shifted-to-the-future plan", async () => {
  const seriesQueryMock = async () => ({
    "@timestamp": "2000-01-01",
    "value": 1000
  });
  const refsGetParameterMock = async () => ({
    value: {
      curve: [
        {date: "2001-01-01", value: 1100},
        {date: "2001-06-01", value: 1200}
      ]
    }
  });
  const seriesYieldMock = jest.fn();
  await script({
    ...mocks,
    refs: {getParameter: refsGetParameterMock},
    series: {
      query: seriesQueryMock,
      yield: seriesYieldMock,
    },
  });
  expect(seriesYieldMock.mock.calls.length).toEqual(1);
  expect(seriesYieldMock.mock.calls[0][0]).toEqual(1100);
});

test("proyected height for shifted-to-the-past plan", async () => {
  const seriesQueryMock = async () => ({
    "@timestamp": "2000-01-01",
    "value": 1000
  });
  const refsGetParameterMock = async () => ({
    value: {
      curve: [
        {date: "1999-01-01", value: 1100},
        {date: "1999-06-01", value: 1200}
      ]
    }
  });
  const seriesYieldMock = jest.fn();
  await script({
    ...mocks,
    refs: {getParameter: refsGetParameterMock},
    series: {
      query: seriesQueryMock,
      yield: seriesYieldMock,
    },
  });
  expect(seriesYieldMock.mock.calls.length).toEqual(1);
  expect(seriesYieldMock.mock.calls[0][0]).toEqual(1200);
});

test("proyected height for non-trivial plan", async () => {
  const seriesQueryMock = async () => ({
    "@timestamp": "2000-02-01",
    "value": 1000
  });
  const refsGetParameterMock = async () => ({
    // curve is not in order
    value: {
      curve: [
        {date: "2000-07-01", value: 1980},
        {date: "1999-01-01", value: 900},
        {date: "1999-07-01", value: 1260},
        {date: "2000-01-01", value: 1620},
      ]
    }
  });
  const seriesYieldMock = jest.fn();
  await script({
    ...mocks,
    refs: {getParameter: refsGetParameterMock},
    series: {
      query: seriesQueryMock,
      yield: seriesYieldMock,
    },
  });
  expect(seriesYieldMock.mock.calls.length).toEqual(1);
  // aproximately 1680, so accept anything between 1670 and 1690
  expect(seriesYieldMock.mock.calls[0][0]).toBeGreaterThan(1670);
  expect(seriesYieldMock.mock.calls[0][0]).toBeLessThan(1690);
});

test("proyected height for plan with duplicates", async () => {
  const seriesQueryMock = async () => ({
    "@timestamp": "2000-01-01",
    "value": 1000
  });
  const refsGetParameterMock = async () => ({
    // curve is not in order
    value: {
      curve: [
        {date: "2000-07-01", value: 1980},
        {date: "1999-01-01", value: 900},
        {date: "1999-07-01", value: 1260},
        {date: "2000-01-01", value: 1620, group: "group-1"},
        {date: "2000-01-01", value: 1000}
      ]
    }
  });
  const seriesYieldMock = jest.fn();
  await script({
    ...mocks,
    refs: {getParameter: refsGetParameterMock},
    series: {
      query: seriesQueryMock,
      yield: seriesYieldMock,
    },
  });
  expect(seriesYieldMock.mock.calls.length).toEqual(1);
  // for duplicate entries, use the "more specific one" available
  expect(seriesYieldMock.mock.calls[0][0]).toEqual(1620);
});
