const heads = await series.queryAll({head: "*"});
// official variable ordering
const order = [
  "al",
  "as",
  "b",
  "be",
  "cd",
  "chloride",
  "cyanide",
  "co",
  "cr",
  "cu",
  "fluoride",
  "fe",
  "hg",
  "mn",
  "mo",
  "ni",
  "pb",
  "sb",
  "se",
  "sulfates",
  "zn",
  "ph",
  "ce",
].map((suffix) => `.${suffix}`);
const values = heads
      .filter(utils.isDefined)
      .filter(({value}) => value !== null)
      .filter((event) => utils.getMonth() === utils.getMonth(event["@timestamp"]))
      .sort((a, b) => {
        const indexA = order.findIndex((suffix) => a.name.endsWith(suffix));
        const indexB = order.findIndex((suffix) => b.name.endsWith(suffix));
        return indexA < indexB ?
          -1 :
          (indexA === indexB ? 0 : 1);
      })
      .map(({value}) => value);

if (values.length > 0) {
  const weight = Math.sin(2 * Math.PI / values.length);
  const sum = values
        .map((ci, index) => ci * values[(index + 1) % values.length])
        .reduce((partial, c) => partial + c, 0);
  series.save(sum * 0.5 * weight);
}
