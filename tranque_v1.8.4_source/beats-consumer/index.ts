import * as program from "commander";
import * as fs from "fs";
import * as path from "path";

import * as app from "./lib/app";
import * as conf from "./lib/conf";
import * as log from "./lib/log";
import * as outputs from "./lib/outputs";
import {schema} from "./lib/schema";

const pkg = JSON.parse(fs.readFileSync(
  path.join(conf.BASE_DIR, "package.json"),
  "utf-8",
));

program
  .version(pkg.version, "-v, --version");

program
  .command("info")
  .description("Show configuration and exit")
  .action(() => Object.keys(conf)
          .filter((key) => !key.startsWith("_"))
          .forEach((key) => log.trace(`${key} ${conf[key]}`)));

program
  .command("consumer")
  .description("Starts the consumer daemon")
  .action(() => {
    const output = outputs[conf.OUTPUT_MODE];
    app.init({output}).listen(conf.CONSUMER_PORT, "0.0.0.0", () => {
      log.info(`Consumer started listening at port ${conf.CONSUMER_PORT}`);
    });
  });

program
  .command("build-doc")
  .description("Builds the OpenAPI file from the template and event schema")
  .action(() => {
    const template = JSON.parse(fs.readFileSync(
      path.join(conf.BASE_DIR, "openapi.json"),
      "utf-8",
    ));
    const variables = {
      "{version}": pkg.version,
      "{event}": schema,
    };
    const interpolate = (thing) => {
      if (typeof thing === "string" && typeof variables[thing] !== "undefined") {
        return variables[thing];
      }
      if (typeof thing === "object" && Array.isArray(thing)) {
        return thing.map(interpolate);
      }
      if (typeof thing === "object") {
        return Object.fromEntries(Object.entries(thing).map(([k, v]) => [k, interpolate(v)]));
      }
      return thing;
    };
    fs.writeFileSync(
      path.join(conf.BASE_DIR, "openapi.built.json"),
      JSON.stringify(interpolate(template)),
    );
  });

program.parse(process.argv);
