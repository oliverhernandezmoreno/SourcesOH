/**
 * Compute the arithmetic mean for a set of data.
 *
 * @param data <any[]> the input data.
 * @param mapFn <function(any => number)> an optional mapping
 * function; defaults to accessing the 'value' property in elements of
 * data.
 * @throws Will throw an error if the data given is insufficient.
 * @returns <number> the arithmetic mean
 */
module.exports.mean = (data, mapFn) => {
  if (data.length === 0) {
    throw new Error("variance called on insufficient data");
  }
  const mapper = typeof mapFn === "undefined" ? (({value}) => value) : mapFn;
  const sum = data.map(mapper).reduce((partial, e) => partial + e, 0);
  return sum / data.length;
};

/**
 * Compute the variace for a set of data.
 *
 * @param data <any[]> the data to compute the variace over.
 * @param mapFn <function(any => number)> an optional mapping
 * function; defaults to accessing the 'value' property in elements of
 * data.
 * @throws Will throw an error if the data given is insufficient (must
 * be at least two values).
 * @returns <number> the variance
 */
module.exports.variance = (data, mapFn) => {
  if (data.length < 2) {
    throw new Error("variance called on insufficient data");
  }
  const mapper = typeof mapFn === "undefined" ? (({value}) => value) : mapFn;
  const mean = module.exports.mean(data, mapper);
  const squareSum = data.map(mapper).map((x) => (x - mean) ** 2).reduce((partial, s) => partial + s, 0);
  return squareSum / (data.length - 1);
};

/**
 * Compute the standard deviation for a set of data.
 *
 * @param data <any[]> the data to compute the standard deviation
 * over.
 * @param mapFn <function(any => number)> an optional mapping
 * function; defaults to accessing the 'value' property in elements of
 * data.
 * @returns <number> the standard deviation
 */
module.exports.standardDeviation = (data, mapFn) => Math.sqrt(module.exports.variance(data, mapFn));
