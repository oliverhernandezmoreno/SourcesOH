import * as express from "express";

import * as conf from "./conf";
import * as log from "./log";
import * as outputs from "./outputs";
import * as schema from "./schema";

interface IOptions {
  output: outputs.IOutput;
  limit?: number;  // the max size, in bytes, of the request body
}

export const makeError = (name) => (message) => {
  const err = new Error(message);
  err.name = name;
  return err;
};

export const badRequest = makeError("BadRequest");
export const unauthorized = makeError("Unauthorized");
export const notFound = makeError("NotFound");

export const isAuthorized = (auth: string) => {
  if (typeof auth === "undefined") {
    return false;
  }
  if ((/Token [A-Za-z0-9_\-=]+/).test(auth)) {
    return conf.ACCESS_PASSWORDS.indexOf(auth.slice("Token ".length)) !== -1;
  }
  if ((/Bearer [A-Za-z0-9_\-=]+/).test(auth)) {
    return conf.ACCESS_PASSWORDS.indexOf(auth.slice("Bearer ".length)) !== -1;
  }
  return false;
};

export const tagEvent: (event: schema.IEvent, tags: Map<string, string>) => schema.IEvent = (event, tags) => {
  return {
    ...event,
    labels: [
      ...event.labels,
      {key: "beats-consumer-version", value: conf.COMMIT},
      ...Array.from(tags.entries()).map(([key, value]) => ({key, value})),
    ],
  };
};

export const init = (options: IOptions) => {
  const app = express();

  app.set("env", "production");
  app.set("x-powered-by", false);

  app.use((req, res, next) => {
    if (req.method === "POST" && !isAuthorized(req.get("authorization"))) {
      throw unauthorized("invalid or missing credentials");
    }
    next();
  });

  app.use(express.json({
    limit: typeof options.limit === "undefined" ?
      20 * 1024 * 1024 :
      options.limit,
    type: (req) => true,
  }));

  app.get("/docs/", (req, res) => res.sendFile("doc.html", {root: conf.BASE_DIR}));

  app.get("/health/", (req, res) => {
    const ok = outputs.client().connected;
    res.status(ok ? 200 : 500).json({
      status: ok ? "pass" : "fail",
      details: {
        "redis:connected": [{
          status: ok ? "pass" : "fail",
          time: new Date(),
        }],
      },
    });
  });

  app.post("/", (req, res) => {
    if (!req.body) {
      throw badRequest("invalid JSON body");
    }
    const events: schema.IEvent[] = schema.validateEvents(req.body, badRequest);
    if (events.length === 0) {
      log.info("Got empty events vector");
    } else {
      log.info(`Got ${events.length} events`);
      const tags = new Map(Object.entries({
        "consumed-at": (new Date()).toJSON(),
      }));
      options.output(events.map((event) => tagEvent(event, tags)));
    }
    res.status(200).json({count: events.length, success: true});
  });

  app.use((req) => {
    throw notFound(`route not found: ${req.method} ${req.originalUrl}`);
  });

  app.use((err, req, res, next) => {
    log.error(err.toString());
    const status = ({
      BadRequest: 400,
      SyntaxError: 400,
      Unauthorized: 401,
      NotFound: 404,
    })[err.name] || 500;
    const timeout = ({
      401: 3000,
    })[status] || 0;
    setTimeout(() => res.status(status).json({error: err.toString()}), timeout);
  });

  return app;
};
