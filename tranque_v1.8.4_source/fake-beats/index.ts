import * as program from "commander";
import * as fs from "fs";
import * as path from "path";

import * as bh from "./lib/behaviour";
import * as conf from "./lib/conf";
import * as control from "./lib/control";
import * as generator from "./lib/generator";
import * as log from "./lib/log";
import * as outputs from "./lib/outputs";

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
  .command("beater")
  .description("Starts the beater deamon")
  .action(() => {
    const output = outputs[conf.OUTPUT_MODE];
    const makeBeaters = () => conf.FAKING_BEHAVIOUR.value()
      .map((behaviour) => generator.makeBeater(behaviour, output));

    let beaters = makeBeaters();
    beaters.forEach((beater) => beater.start());
    log.info(`Started ${beaters.length} beaters`);

    const controller = new control.Controller({port: conf.CONTROL_PORT});
    controller.on(control.RESTART, () => {
      log.info("Restarting beaters");
      beaters.forEach((beater) => beater.stop());
      conf.FAKING_BEHAVIOUR.expire();
      beaters = makeBeaters();
      beaters.forEach((beater) => beater.start());
      log.info(`Started ${beaters.length} beaters`);
    });

    controller.start();
  });

program
  .command("static <fromdate> <todate>")
  .description("Runs a static simulation, with output to stdout")
  .action((fromdate, todate) => {
    const behaviours = conf.FAKING_BEHAVIOUR.value();

    const fromDate = new Date(fromdate);
    if (isNaN(fromDate.getTime())) {
      log.trace(`fromdate is not a valid date: ${fromdate}`);
      process.exit(1);
    }

    const toDate = new Date(todate);
    if (isNaN(toDate.getTime())) {
      log.trace(`todate is not a valid date: ${todate}`);
      process.exit(1);
    }
    if (toDate.getTime() < fromDate.getTime()) {
      log.trace("todate must be ahead of fromdate");
      process.exit(1);
    }

    behaviours.reduce((previous, behaviour) => previous.then(() => generator.staticRun(
      behaviour,
      fromDate,
      toDate,
    )), Promise.resolve());
  });

program.parse(process.argv);
