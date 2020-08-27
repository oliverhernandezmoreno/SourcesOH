// average the polygon areas
const heads = await series.queryAll({head: "*"});
const values = heads
      .filter(utils.isDefined)
      .map(({value}) => value)
      .filter((value) => value !== null);

if (values.length > 0) {
  const sum = values.reduce((partial, v) => partial + v, 0);
  series.save(sum / values.length);
}
