const events = series.current("*");
const ref = await refs.getOne("*");
events.forEach((item) => series.yield(item.value, {
  timestamp: item["@timestamp"],
  meta: {item, ref}
}));
