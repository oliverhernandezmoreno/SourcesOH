const events = series.current("*.valid-variables.*");
const varRef = await refs.getOne("*.variables.*");
const threshold = varRef.active_thresholds.find((t) => t.kind === "ii" && t.upper !== null);
if (events.length > 0 && utils.isDefined(threshold)) {
  const upper = parseFloat(threshold.upper);
  const currentValue = Math.max(...events.map((event) => event.value));
  if (threshold.lower !== null) {
    const lower = parseFloat(threshold.lower);
    const delta = (upper - lower) / 2;
    const offset = Math.abs(currentValue - ((upper + lower) / 2));
    const normalized = 0.5 * (Math.tanh((offset - delta) / (delta / 2)) + 1);
    series.save(
      normalized,
      null,
      null,
      null,
      {
        threshold,
        input: currentValue,
      },
    );
  } else {
    const normalized = 0.5 * (Math.tanh((currentValue - upper) / (upper / 2)) + 1);
    series.save(
      normalized,
      null,
      null,
      null,
      {
        threshold,
        input: currentValue,
      },
    );
  }
}
