const models = require("./models");

module.exports = (name, protocol, timestamp, meta, decider = () => false) =>
  models.sequelize.transaction(async (transaction) => {
    const timeseries = await models.Timeseries.findOne({
      attributes: ["id"],
      where: {canonical_name: name},
      transaction,
    });
    if (timeseries === null) {
      throw new Error(`timeseries ${name} doesn't exist`);
    }
    const activeProtocol = await models.AcquiredProtocol.findOne({
      where: {active: true, timeseries_id: timeseries.id},
      transaction,
    });
    if (
      activeProtocol !== null &&
      (activeProtocol.created_at.toJSON() > new Date(timestamp).toJSON() ||
        !decider(activeProtocol))
    ) {
      return null;
    }
    await models.AcquiredProtocol.update(
      {active: false},
      {where: {timeseries_id: timeseries.id}, transaction}
    );
    const measurementProtocol = await models.MeasurementProtocol.findOne({
      where: {id: protocol},
      transaction,
    });
    if (measurementProtocol === null) {
      await models.MeasurementProtocol.create({id: protocol}, {transaction});
    }
    return models.AcquiredProtocol.create(
      {
        timeseries_id: timeseries.id,
        created_at: new Date(timestamp),
        protocol_id: protocol,
        meta,
      },
      {transaction}
    );
  });
