const program = require("commander");
const fs = require("fs");
const {sequelize} = require("../lib/backend/models");

program
  .command("sync")
  .description("Creates all tables linked to the declared models")
  .action(
    () => sequelize.sync()
      .then(() => console.log("Synched database models"))
      .catch((err) => {
        console.error(err);
        process.exit(1);
      })
      .then(() => process.exit(0)),
  );

program
  .command("dump [model...]")
  .description("Dumps all objects within the database in JSON format")
  .action(
    (models) => Object.entries(sequelize.models)
      .filter(([modelName]) => models.length === 0 || models.indexOf(modelName) !== -1)
      .reduce((acc, [modelName, model]) => acc.then(async (prev) => {
        const previous = await prev;
        const entries = await model.findAll();
        return [...previous, [modelName, entries]];
      }), Promise.resolve([]))
      .then((dumps) => dumps.reduce((acc, [modelName, entries]) => ({...acc, [modelName]: entries}), {}))
      .then((data) => process.stdout.write(JSON.stringify(data)))
      .then(() => process.exit(0))
      .catch((err) => {
        console.error(err);
        process.exit(1);
      }),
  );

program
  .command("load <fixtures>")
  .description("Loads fixtures within the <fixtures> file")
  .action(
    (fixtures) => sequelize.transaction((transaction) => {
      const data = JSON.parse(fs.readFileSync(fixtures, "utf8"));
      return Object.entries(data)
        .reduce(
          (p, [modelName, objects]) => p.then(
            () => sequelize.model(modelName).bulkCreate(objects, {transaction}),
          ),
          Promise.resolve(null),
        );
    })
      .then(() => console.log("Loaded fixtures whithin", fixtures))
      .catch((err) => {
        console.error(err.toString());
        process.exit(1);
      })
      .then(() => process.exit(0)),
  );

program
  .command("check-schema")
  .description("Checks that the database in consistent with the models")
  .action(
    () => Object.keys(sequelize.models)
      .reduce(async (previous, name) => {
        await previous;
        // If a query can be made without issue, it's good enough
        await sequelize.model(name).findAll({limit: 1});
      }, Promise.resolve(null))
      .catch((err) => {
        console.error(err.toString());
        process.exit(1);
      })
      .then(() => {
        console.log("Database seems consistent with the schema");
        process.exit(0);
      }),
  );

program
  .parse(process.argv);
