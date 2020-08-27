const Sequelize = require("sequelize");

const models = require("./models");

module.exports = async (names) => {
  const linkedTimeseries = await models.Timeseries.findAll({
    attributes: ["id", "canonical_name"],
    where: {
      canonical_name: {[Sequelize.Op.in]: Array.from(names)},
      active: true,
    },
    include: {
      model: models.DataSource,
      where: {active: true},
    },
  });
  const unlinkedTimeseries = await models.Timeseries.findAll({
    attributes: ["id", "canonical_name"],
    where: {
      canonical_name: {[Sequelize.Op.in]: Array.from(names)},
      active: true,
      data_source_id: null,
    },
  });
  return new Set([
    ...linkedTimeseries.map((ts) => ts.canonical_name),
    ...unlinkedTimeseries.map((ts) => ts.canonical_name),
  ]);
};
