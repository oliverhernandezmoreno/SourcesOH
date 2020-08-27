/* global expect, test */
const {hollowDependencies} = require("./dependencies");

test("time utils", () => {
  const ts_getYears = "2018";
  const ts_getMonths = "2018-01";
  const ts_yearsAgo = "2017-01-01T00:00:00.000Z";
  const ts_monthsAgo = "2017-12-01T00:00:00.000Z";
  const ts = "2018-01-01T00:00:00.000Z";

  expect(hollowDependencies.utils.getMonth(ts)).toEqual(ts_getMonths);
  expect(hollowDependencies.utils.getYear(ts)).toEqual(ts_getYears);

  expect(hollowDependencies.utils.monthsAgo(ts, 1)).toEqual(ts_monthsAgo);
  expect(hollowDependencies.utils.yearsAgo(ts, 1)).toEqual(ts_yearsAgo);
  expect(hollowDependencies.utils.monthsAgo(ts_monthsAgo, -1)).toEqual(ts);

  expect(hollowDependencies.utils.diffInYears(ts, ts_yearsAgo)).toEqual(1);
  expect(hollowDependencies.utils.diffInMonths(ts, ts_monthsAgo)).toEqual(1);
  expect(hollowDependencies.utils.diffInMonths(ts, ts_yearsAgo)).toEqual(12);

  expect(hollowDependencies.utils.isAfter(ts_monthsAgo, ts_yearsAgo)).toEqual(true);
  expect(hollowDependencies.utils.isAfter(ts_yearsAgo, ts_monthsAgo)).toEqual(false);
  expect(hollowDependencies.utils.isBefore(ts_yearsAgo, ts_monthsAgo)).toEqual(true);
  expect(hollowDependencies.utils.isBefore(ts_monthsAgo, ts_yearsAgo)).toEqual(false);

  expect(hollowDependencies.utils.unixTimestampToDate(123456789)).toEqual(
    "1973-11-29T21:33:09.000Z"
  );
  expect(hollowDependencies.utils.dateToUnixTimestamp("1973-11-29")).toEqual(123379200);

  expect(
    hollowDependencies.utils.dateToUnixTimestamp(
      hollowDependencies.utils.unixTimestampToDate(123456789)
    )
  ).toEqual(123456789);
});

test("assertion utils", () => {
  expect(hollowDependencies.utils.isDefined({})).toEqual(true);
  expect(hollowDependencies.utils.isDefined(undefined)).toEqual(false);
  expect(hollowDependencies.utils.isDefined(null)).toEqual(false);

  expect(hollowDependencies.utils.isUndefined({})).toEqual(false);
  expect(hollowDependencies.utils.isUndefined(undefined)).toEqual(true);
  expect(hollowDependencies.utils.isUndefined(null)).toEqual(true);

  expect(hollowDependencies.utils.assert({})).toEqual({});
  expect(() => hollowDependencies.utils.assert(undefined)).toThrow("utils.assert failed");
  expect(() => hollowDependencies.utils.assert(null)).toThrow("utils.assert failed");
});
