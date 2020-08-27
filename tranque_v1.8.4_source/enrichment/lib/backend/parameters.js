const models = require("./models");

module.exports = async (timeseriesName, canonicalName = null) => {
  const timeseries = await models.Timeseries.findOne({
    where: {canonical_name: timeseriesName},
  });
  if (timeseries === null) {
    throw new Error(`non-existent time series: ${timeseriesName}`);
  }
  const parameters = await models.Parameter.findAll({
    where: {
      target_id: timeseries.target_id,
      ...(canonicalName === null ? {} : {canonical_name: canonicalName}),
    },
  });
  return parameters.map((p) => ({
    id: p.id,
    canonical_name: p.canonical_name,
    value: p.value,
  }));
};
