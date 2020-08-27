import * as EventEmitter from "events";
import * as http from "http";
import * as url from "url";

import * as log from "./log";

export const RESTART = "restart";

// path -> event
const paths = {
  "/restart": RESTART,
};

export class Controller extends EventEmitter {

  private port;
  private server;

  constructor({port}) {
    super();
    this.port = port;
    this.server = http.createServer((req, res) => {
      if (req.method !== "POST") {
        log.debug(`Ignoring non-POST request (${req.method})`);
        res.statusCode = 405;
        res.end();
        return null;
      }
      const path = url.parse(req.url).pathname;
      const event = paths[path];
      if (!event) {
        log.debug(`Ignoring unknown path ${req.url}`);
        res.statusCode = 404;
        res.end();
        return null;
      }
      this.emit(event);
      res.statusCode = 204;
      res.end();
    });
  }

  public start() {
    this.server.listen(this.port, "0.0.0.0", () => log.info("Started control http server"));
  }

  public stop() {
    this.server.close();
  }
}
