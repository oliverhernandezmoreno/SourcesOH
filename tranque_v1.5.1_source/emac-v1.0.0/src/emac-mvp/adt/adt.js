const arima = await series.queryAll({head: "*.arima.*"})
      .then((events) => events.filter(utils.isDefined));

if (arima.length > 0) {
  const arimaNames = refs.expand("*.arima.*");
  const allRefs = await refs.getMany("*");
  const varRefs = allRefs.filter(({canonical_name}) => arimaNames.indexOf(canonical_name) === -1);
  const thresholdsBySource = varRefs.reduce(
    (groups, ref) => ({
      ...groups,
      [ref.data_source.id]: ref.active_thresholds
        .filter(({kind}) => utils.isDefined(kind))
        .map((t) => ({
          lower: t.lower === null ? null : parseFloat(t.lower),
          upper:  t.upper === null ? null : parseFloat(t.upper),
        }))
    }),
    {},
  );
  const mappedArima = arima
  // map each event to the base variable reference "ref"
        .map((event) => ({
          ref: varRefs
            .find(
              ({data_source}) => data_source.id === (
                allRefs.find(({canonical_name}) => canonical_name === event.name) || {data_source: {}}
              ).data_source.id,
            ),
          predictions: event.meta.predictions,
        }))
        .filter(({ref}) => utils.isDefined(ref))
  // extract thresholds and canonical_name of said base variable
        .map(({ref, predictions}) => ({
          variable: ref.canonical_name,
          predictions,
          thresholds: thresholdsBySource[ref.data_source.id],
        }));

  // Detect three possible scenarios:
  // - there's no thresholds available to use --> -1
  // - there are thresholds and no prediction exceeds any of them --> 0
  // - there are thresholds and at least one prediction exceeds one of them --> 1
  if (mappedArima.filter(({thresholds}) => (thresholds || []).length > 0).length === 0) {
    series.yield(-1);
  } else {
    const excess = mappedArima
          .filter(
            ({predictions, thresholds}) => predictions
              .some(
                ({value}) => thresholds
                  .some((t) => (t.upper !== null && t.upper < value) || (t.lower !== null && t.lower > value))
              )
          );
    series.yield(
      excess.length > 0 ? 1 : 0,
      {meta: {issues: excess.map(({variable}) => variable)}},
    );
  }
}
