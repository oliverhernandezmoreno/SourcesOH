/* global jest */
const request = jest.requireActual("request");

const log = require("../lib/log");

let mockingRules = [];

const withRule = (uri, response, responseBody) => async (fn) => {
  const rule = {uri, response, responseBody};
  mockingRules = [...mockingRules, rule];
  const result = await Promise.resolve(fn());
  mockingRules = mockingRules.filter((r) => r !== rule);
  return result;
};

const fn = (options, callback) => {
  const uri = typeof options === "string" ? options : options.uri;
  if (uri) {
    const matchingRule = mockingRules.find((rule) => uri === rule.uri);
    if (matchingRule) {
      log.info(`Using mocked request for uri ${uri}`);
      return (callback || options.callback || (() => null))(
        null,
        matchingRule.response,
        matchingRule.responseBody
      );
    }
  }
  return request(options, callback);
};

Object.assign(fn, request, {withRule});

module.exports = fn;
