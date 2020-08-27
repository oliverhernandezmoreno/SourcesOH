const manual = await series.query({head: "*.variacion-brusca"});
if (utils.isDefined(manual) && manual.value > 0) {
  return series.yield(true, {meta: {manual: true}});
}

const ref = await refs.getOne("*.caudal");

const cvlb = utils.assert(
  ref.active_thresholds
    .filter(({kind, upper}) => kind === "coeficiente-variacion-linea-base" && upper !== null)
    .map(({upper}) => parseFloat(upper))[0]
);

const alfa = utils.assert(
  ref.active_thresholds
    .filter(({kind, upper}) => kind === "porcentaje-variacion" && upper !== null)
    .map(({upper}) => parseFloat(upper))[0]
);

const [media, std] = await series.query([
  {head: "*.media"},
  {head: "*.std"},
]);

if (utils.isUndefined(media) || utils.isUndefined(std)) {
  return series.yield(0, {meta: {manual: false, cvlb, alfa}});
}

if (media.value === 0) {
  return series.yield(
    std.value > 0,
    {meta: {manual: false, media: media.value, std: std.value, cvlb, alfa}}
  );
}
const cva = std.value / media.value;
series.yield(
  cva >= cvlb * (1 + alfa),
  {meta: {manual: false, media: media.value, std: std.value, cvlb, alfa}}
);
