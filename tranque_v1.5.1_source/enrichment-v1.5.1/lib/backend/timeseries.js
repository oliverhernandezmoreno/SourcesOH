const Sequelize = require("sequelize");

const models = require("./models");
const versions = require("./versions");

const BOT = "__BoT__";
const EOT = "__EoT__";

const wholeInterval = {
  from: BOT,
  to: EOT,
};

// Builds a set of validity intervals for the given instance, which is
// versioned with reversion and has an 'active' property.
const validityIntervals = async (model, instance) => {
  let stateChanges = await versions(model, instance.id, ["active"]);
  if (stateChanges.length === 0) {
    return instance.active ? [{...wholeInterval}] : [];
  }
  stateChanges = [
    ...stateChanges,
    ...(instance.active === stateChanges[stateChanges.length - 1].object.active
      ? []
      : [
          {
            timestamp: stateChanges[stateChanges.length - 1].timestamp,
            object: {active: instance.active},
          },
        ]),
  ];

  if (stateChanges.length === 1) {
    return stateChanges[0].object.active ? [{...wholeInterval}] : [];
  }
  const activeIntervals = stateChanges
    .slice(0, -1)
    .map((s, index) => [s, stateChanges[index + 1]])
    .filter(([first]) => first.object.active)
    .map(([first, second]) => ({from: first.timestamp, to: second.timestamp}));
  // starts inactive, ends active
  if (activeIntervals.length === 0) {
    return [{from: stateChanges[stateChanges.length - 1].timestamp, to: EOT}];
  }
  // general case
  return [
    ...[
      stateChanges[0].object.active
        ? {from: BOT, to: activeIntervals[0].to}
        : activeIntervals[0],
    ],
    ...activeIntervals.slice(1),
    ...(stateChanges[stateChanges.length - 1].object.active
      ? [{from: stateChanges[stateChanges.length - 1].timestamp, to: EOT}]
      : []),
  ];
};

// Builds a set of intervals that is the intersection of the two sets
// of intervals.
const intersectIntervals = (setA, setB) =>
  setA.flatMap((aInt) =>
    setB
      .map((bInt) => ({
        from:
          aInt.from === BOT
            ? bInt.from
            : bInt.from === BOT
            ? aInt.from
            : aInt.from > bInt.from
            ? aInt.from
            : bInt.from,
        to:
          aInt.to === EOT
            ? bInt.to
            : bInt.to === EOT
            ? aInt.to
            : aInt.to > bInt.to
            ? bInt.to
            : aInt.to,
      }))
      .filter(({from, to}) => from === BOT || to === EOT || from < to)
  );

// Injects DataSourceGroup(s) to each of the given data sources.
const injectGroups = async (dataSources) => {
  const mappings = await models.DataSourceInGroup.findAll({
    where: {datasource_id: {[Sequelize.Op.in]: dataSources.map((ds) => ds.id)}},
  });
  const groupIds = Array.from(new Set(mappings.map((m) => m.datasourcegroup_id)));
  const groups = await models.DataSourceGroup.findAll({
    where: {id: {[Sequelize.Op.in]: groupIds}},
  });
  const groupMap = new Map(groups.map((g) => [g.id, g.canonical_name]));
  return new Map(
    Object.entries(
      mappings.reduce(
        (acc, pair) => ({
          ...acc,
          [pair.datasource_id]: [
            ...(acc[pair.datasource_id] || []),
            groupMap.get(pair.datasourcegroup_id),
          ],
        }),
        {}
      )
    )
  );
};

// The main query, fetches the 'standard' timeseries structure for
// each of the given names.
module.exports = async (names) => {
  if (names.length === 0) {
    return [];
  }
  const timeseries = await models.Timeseries.findAll({
    where: {canonical_name: {[Sequelize.Op.in]: names}},
  });
  const nameMap = new Map(
    Object.entries(
      timeseries.reduce((acc, ts) => ({...acc, [ts.canonical_name]: ts}), {})
    )
  );

  const missing = names.filter((name) => typeof nameMap.get(name) === "undefined");
  if (missing.length > 0) {
    throw new Error(`non-existent time series: ${missing.join(", ")}`);
  }

  const inputs = await models.TimeseriesInput.findAll({
    where: {from_timeseries_id: {[Sequelize.Op.in]: timeseries.map((ts) => ts.id)}},
    include: [
      {
        association: models.TimeseriesInputAssoc,
        required: true,
        attributes: ["canonical_name"],
      },
    ],
  }).then(
    (tsInputs) =>
      new Map(
        Object.entries(
          tsInputs.reduce(
            (acc, tsInput) => ({
              ...acc,
              [tsInput.from_timeseries_id]: [
                ...(acc[tsInput.from_timeseries_id] || []),
                tsInput.input.canonical_name,
              ],
            }),
            {}
          )
        )
      )
  );

  const targetIds = Array.from(
    new Set(timeseries.map((t) => t.target_id).filter((id) => id !== null))
  );
  const targets = await (targetIds.length === 0
    ? Promise.resolve([])
    : models.Target.findAll({
        where: {id: {[Sequelize.Op.in]: targetIds}},
      }));
  const targetMap = new Map(targets.map((t) => [t.id, t]));

  const dataSourceIds = Array.from(
    new Set(timeseries.map((t) => t.data_source_id).filter((id) => id !== null))
  );
  const dataSources = await (dataSourceIds.length === 0
    ? Promise.resolve([])
    : models.DataSource.findAll({
        where: {id: {[Sequelize.Op.in]: dataSourceIds}},
      }));
  const dataSourceMap = new Map(dataSources.map((ds) => [ds.id, ds]));
  const dataSourceGroupMap = await injectGroups(dataSources);

  const sourceIntervals = await dataSources.reduce(async (p, ds) => {
    const previous = await p;
    const vis = await validityIntervals(models.DataSource, ds);
    return {...previous, [ds.id]: vis};
  }, Promise.resolve({}));

  const seriesIntervals = await timeseries.reduce(async (p, ts) => {
    const previous = await p;
    const vis = await validityIntervals(models.Timeseries, ts);
    return {...previous, [ts.id]: vis};
  }, Promise.resolve({}));

  const thresholds = await models.Threshold.findAll({
    where: {
      timeseries_id: {[Sequelize.Op.in]: timeseries.map((t) => t.id)},
      active: true,
    },
  });
  const thresholdMap = new Map(
    Object.entries(
      thresholds.reduce(
        (acc, th) => ({
          ...acc,
          [th.timeseries_id]: [
            ...(acc[th.timeseries_id] || []),
            {
              created_at: th.created_at.toJSON(),
              timeseries_id: th.timeseries_id,
              active: th.active,
              lower: th.lower,
              upper: th.upper,
              kind: th.kind,
            },
          ],
        }),
        {}
      )
    )
  );

  return names
    .map((name) => nameMap.get(name))
    .map((ts) => ({
      id: ts.id,
      canonical_name: ts.canonical_name,
      template_name: ts.template_name,
      highlight: ts.highlight,
      type: ts.type,
      labels: (ts.labels || []).map((label) => ({key: label.key, value: label.value})),
      script: ts.script,
      script_version: ts.script_version,
      active: ts.active,
      range_gte: ts.range_gte,
      range_gt: ts.range_gt,
      range_lte: ts.range_lte,
      range_lt: ts.range_lt,
      data_source:
        ts.data_source_id === null
          ? null
          : ((ds) => ({
              id: ds.id,
              hardware_id: ds.hardware_id,
              canonical_name: ds.canonical_name,
              active: ds.active,
              coords: ds.coords ? {...ds.coords} : null,
              groups: dataSourceGroupMap.get(ds.id) || [],
            }))(dataSourceMap.get(ts.data_source_id)),
      target:
        ts.target_id === null
          ? null
          : ((t) => ({
              id: t.id,
              canonical_name: t.canonical_name,
              coords: t.coords ? {...t.coords} : null,
            }))(targetMap.get(ts.target_id)),
      active_thresholds: thresholdMap.get(ts.id) || [],
      validity_intervals: intersectIntervals(
        seriesIntervals[ts.id],
        ts.data_source_id === null
          ? [{...wholeInterval}]
          : sourceIntervals[ts.data_source_id]
      ),
      inputs: inputs.get(ts.id) || [],
    }));
};
