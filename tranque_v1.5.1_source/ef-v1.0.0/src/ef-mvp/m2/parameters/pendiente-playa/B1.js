const porcentajeCercania = await refs.getParameter("porcentaje-cercania-pendiente-playa");

const value = await series.query({head: "*"});
const ref = await refs.getOne("*");
const threshold = ref.active_thresholds
      .filter(({upper}) => upper !== null)
      .map(({upper}) => parseFloat(upper))
      .sort((a, b) => a - b)[0];

if (utils.isDefined(value) && utils.isDefined(threshold)) {
  const tolerance = porcentajeCercania.value === null ? 0 : porcentajeCercania.value;
  series.yield(
    ~~(value.value >= threshold * (1 - tolerance)),
    {meta: {value: value.value, threshold, tolerance}}
  );
}
