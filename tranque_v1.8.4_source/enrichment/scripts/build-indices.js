const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

const conf = require("../lib/conf");
const {hollowDependencies} = require("../impl/engine/dependencies");


const BASE_DIR = path.join(conf.IMPLEMENTATION_BASE, "engine", "indices");

const parser = ({
  json: (data) => JSON.parse(data),
  yml: (data) => yaml.safeLoad(data),
  yaml: (data) => yaml.safeLoad(data),
})[conf.PROFILES_FORMAT];

const dependencies = Object.keys(hollowDependencies);

const walk = (base, dir) => {
  let entries;
  try {
    entries = fs.readdirSync(path.join(base, ...dir)).map((entry) => ({
      entry: [...dir, entry],
      stat: fs.statSync(path.join(base, ...[...dir, entry])),
    }));
  } catch (_) {
    console.error(`Couldn't walk to ${path.join(base, ...dir)}`);
    return [];
  }
  return [
    ...entries
      .filter(({stat}) => stat.isFile())
      .filter(({entry}) => entry[entry.length - 1].endsWith(`.${conf.PROFILES_FORMAT}`))
      .map(({entry}) => [
        ...entry.slice(0, -1),
        entry[entry.length - 1].slice(0, -1 - conf.PROFILES_FORMAT.length),
      ]),
    ...entries
      .filter(({stat}) => stat.isDirectory())
      .map(({entry}) => walk(base, entry))
      .reduce((flat, nested) => [...flat, ...nested], []),
  ];
};

module.exports = () => {
  if (typeof parser === "undefined") {
    throw new Error(`profile format not understood: ${conf.PROFILES_FORMAT}`);
  }
  const inventory = walk(BASE_DIR, ".")
        .map((entry) => ({
          version: entry.slice(1, 3).join(":"),
          timeseries: entry.slice(3).join("."),
          contents: parser(fs.readFileSync(`${path.join(BASE_DIR, ...entry)}.${conf.PROFILES_FORMAT}`, "utf8")).script,
        }));
  const catalog = inventory
        .filter(({contents}) => typeof contents !== "undefined")
        .reduce((grouped, {version, timeseries, contents}) => ({
          ...grouped,
          [timeseries]: {...(grouped[timeseries] || {}), [version]: contents},
        }), {});
  Object.entries(catalog)
    .forEach(([timeseries, versions]) => {
      fs.writeFileSync(
        path.join(BASE_DIR, `${timeseries}.js`),
        Object.entries(versions)
          .map(([version, procedure]) => `module.exports["${version}"] = async ({${dependencies.join(", ")}}) => {\n${procedure}\n};`).join("\n"),
        "utf8",
      );
      console.log("Wrote index module", timeseries);
    });
};

if (require.main === module) {
  module.exports();
}
