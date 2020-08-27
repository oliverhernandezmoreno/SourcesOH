const request = require("request");

const conf = require("./conf");
const log = require("./log");

const normalizePath = (path) => {
  let p = path.trim();
  while (p.startsWith("/")) {
    p = p.slice(1);
  }
  if (!p) {
    return p;
  }
  return p;
};

const invoke = (path, body) =>
  new Promise((resolve, reject) => {
    log.debug("Invoking stats request", {path, body});
    request(
      {
        uri: `http://${conf.STATS_HOST}:${conf.STATS_PORT}/${normalizePath(path)}`,
        method: "POST",
        body,
        json: true,
      },
      (error, response, responseBody) => {
        if (error) {
          log.exception(error);
          return reject(error);
        }
        if (response.statusCode < 200 || response.statusCode >= 300) {
          log.error("Stats status code error", {
            status: response.statusCode,
            body: responseBody,
          });
          return reject(new Error(`${path}: status ${response.statusCode}`));
        }
        log.debug("Received stats response", {body: responseBody});
        return resolve(responseBody);
      }
    );
  });

exports.invoke = invoke;
