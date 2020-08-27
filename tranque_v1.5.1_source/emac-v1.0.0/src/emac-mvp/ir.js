// Fetch all references and group them by data source.
const vars = await refs.getMany("*.normalized-variables.*");
const byDataSource = vars.reduce(
  (grouped, ref) => ({
    ...grouped,
    [ref.data_source.id]: [...(grouped[ref.data_source.id] || []), ref],
  }),
  {},
);

// Fetch all series heads, and filter them by calendar month (the
// current one).
const allHeads = await series.queryAll({head: vars})
      .then(
        (events) => events
          .filter(utils.isDefined)
          .filter((event) => utils.getMonth() === utils.getMonth(event["@timestamp"]))
      );

// Abort if there's not enough data sources (at least 2)
const consideredSources = Object.keys(
  allHeads
    .map((event) => vars.find((ref) => ref.canonical_name === event.name))
    .filter(utils.isDefined)
    .map((ref) => ref.data_source.id)
    .filter((id) => utils.isDefined(byDataSource[id]))
    .reduce((acc, id) => ({...acc, [id]: true}), {}),
);
if (consideredSources.length < 2) {
  return;
}

// Collect excluded templates
const risks = (await series.queryAll({head: "*.point-risk"})).filter(utils.isDefined);
const excludedTemplates = Array.from(new Set(
  risks
    .reduce(
      (flat, {meta: {excludedTemplates}}) => [...flat, ...excludedTemplates],
      [],
    )
));

// Select the heads which weren't excluded (according to their
// template)
const heads = allHeads
      .filter(
        (event) => excludedTemplates.indexOf(
          (vars.find((ref) => ref.canonical_name === event.name) || {}).template_name,
        ) === -1,
      );

if (heads.length > 0) {
  // Add risk weights
  const riskWeight = risks
        .map(({value}) => value)
        .reduce((sum, w) => sum + w, 0);
  const byName = heads.reduce(
    (grouped, head) => ({...grouped, [head.name]: head}),
    {},
  );
  // Find the highest value
  const max = Math.max(...heads.map((event) => event.value));
  // Select the sources that are risky
  const riskyPoints = Object.values(byDataSource)
        .map((vars) => [
          vars[0].data_source,
          vars.some(
            (ref) => utils.isDefined(byName[ref.canonical_name]) &&
              byName[ref.canonical_name].value > 0.5,
          ),
        ])
        .filter(([_, isRisky]) => isRisky)
        .map(([well]) => well);
  // Compute distances to each risky point
  const referencePoint = await refs.getParameter("ir-reference");
  const distanceReferencePoint = referencePoint && referencePoint.value ?
        {coords: referencePoint.value} :
        ctx.rootRef.target;
  const distances = await Promise.all(
    Object.entries(byDataSource)
      .map(([id, vars]) => utils.distance(
        vars[0].data_source,
        distanceReferencePoint,
      ).then((d) => [id, d])),
  );
  const distanceMap = distances.reduce((acc, [id, d]) => ({...acc, [id]: d}), {});
  const totalDistance = Object.values(distanceMap).reduce((partial, distance) => partial + distance, 0);
  const riskyPointsDistance = riskyPoints
        .map((well) => distanceMap[well.id])
        .reduce((partial, distance) => partial + distance, 0);
  // Compute the actual IR, and save
  const ir = (riskyPointsDistance * riskWeight * max) / totalDistance;
  series.yield(
    ir,
    {
      meta: {
        distanceMap,
        excludedTemplates,
        totalDistance,
        riskyPointsDistance,
        max,
        riskWeight,
        consideredSources,
      },
    },
  );
} else {
  series.yield(0, {meta: {excludedTemplates, consideredSources}});
}
