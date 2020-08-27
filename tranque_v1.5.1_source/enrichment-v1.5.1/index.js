const program = require("commander");
const fs = require("fs");
const path = require("path");
const readline = require("readline");

const conf = require("./lib/conf");
const handler = require("./lib/handler");
const log = require("./lib/log");
const {work} = require("./lib/queue");
const {saveEvents, digest} = require("./lib/timeseries");

const pkg = JSON.parse(
  fs.readFileSync(path.join(conf.BASE_DIR, "package.json"), "utf-8")
);

program.version(pkg.version, "-v, --version");

program
  .command("info")
  .description("Shows configuration and exits")
  .action(() =>
    Object.keys(conf)
      .filter((key) => key.toUpperCase() === key)
      .forEach((key) => log.trace(`${key} ${conf[key]}`))
  );

program
  .command("worker [topic]")
  .description("Starts a worker for the given amqp topic")
  .action((topic = conf.AMQP_TOPIC) => work(topic));

program
  .command("testrun <message>")
  .description("Handles a single message as a worker test run")
  .action((message) => handler.dispatch(message));

program
  .command("digest [index] [chunkSize]")
  .description("Scrolls over an index and identifies data in derived partitions")
  .action((index = "raw-*", chunkSize = "200") => digest(index, parseInt(chunkSize, 10)));

program
  .command("bulksave [file] [chunkSize]")
  .description(
    "Identifies and saves all events found in the given nd-JSON file (or stdin, if no file is given)"
  )
  .action((file, chunkSize = "200") => {
    const maxEvents = parseInt(chunkSize, 10);
    let operation = Promise.resolve(null);
    const events = [];
    // as a thunk to properly close over each chunk
    const bulkSave = (chunk, messageId) => () => {
      log.info(`Bulk saving ${chunk.length} events`);
      return saveEvents(chunk, messageId);
    };

    const rl = readline.createInterface({
      input:
        typeof file === "undefined"
          ? process.stdin
          : fs.createReadStream(file, {encoding: "utf-8"}),
    });

    rl.on("line", (line) => {
      events.push(JSON.parse(line));
      if (events.length >= maxEvents) {
        const messageId = `bulksave-${new Date().toJSON()}`;
        operation = operation
          .then(() => rl.pause())
          .then(bulkSave(events.slice(), messageId))
          .then(() => rl.resume());
        events.splice(0, events.length);
      }
    }).on("close", () => {
      if (events.length > 0) {
        const messageId = `bulksave-${new Date().toJSON()}`;
        operation = operation.then(bulkSave(events.slice(), messageId));
      }
      operation.then(() => log.info("Finished bulk load"));
    });
  });

program.parse(process.argv);
