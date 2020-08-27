/**
 * Interpolate a value in a discrete curve by using linear
 * barycentrics.
 *
 * @param curve <any[]> array of [x, y] pairs, or elements that get
 * transformed to such when applied to mapFn
 * @param x <number> the given x value to interpolate
 * @param mapFn <function(any => [number, number]> an optional
 * mapping function; defaults to the identity function.
 * @param deciderFn <function(any[]) => any> the decider function used
 * when choosing amongst duplicates; defaults to choosing the first
 * one
 * @throws Will throw an error if the given curve is empty.
 * @returns <number> the interpolated y value
 */
module.exports.pointInCurve = (curve, x, mapFn, deciderFn) => {
  if (curve.length === 0) {
    throw new Error("pointInCurve called on an empty curve")
  }
  const mapper = typeof mapFn === "undefined" ? ((x) => x) : mapFn;
  const decider = typeof deciderFn === "undefined" ? ((cs) => cs[0]) : deciderFn;
  // deduplicate the curve
  const xs = Array.from(new Set(curve.map(mapper).map(([x]) => x))).sort((xA, xB) => xA - xB);
  const sortedCurve = xs.map((x) => decider(curve.filter((e) => mapper(e)[0] === x))).map(mapper);
  // x is too far left
  if (x <= sortedCurve[0][0]) {
    return sortedCurve[0][1];
  }
  // x is too far right
  if (x >= sortedCurve[sortedCurve.length - 1][0]) {
    return sortedCurve[sortedCurve.length - 1][1];
  }
  // x is somewhere between extremes, so a segment must exist
  const [
    [x0, y0],
    [x1, y1]
  ] = sortedCurve
        .slice(0, -1)
        .map((pair, i) => [pair, sortedCurve[i + 1]])
        .find(([[x0], [x1]]) => x >= x0 && x < x1);
  // apply barycentrics
  const weight = (x - x0) / (x1 - x0);
  return y0 * (1 - weight) + y1 * weight;
};
