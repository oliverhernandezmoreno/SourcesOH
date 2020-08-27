const events = series.current("*");
events.forEach((item) => series.yield(item.value, {
  timestamp: item["@timestamp"],
  meta: {item}
}));
