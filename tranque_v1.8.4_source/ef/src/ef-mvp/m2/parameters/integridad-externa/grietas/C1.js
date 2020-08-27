const ATENTA_ESTABILIDAD = 1;
const NO_SISMO = 0;

const grietas = await series.query({head: "*.inputs.grietas"});
const sismo = await series.query({head: "*.sismo"});

if (utils.isDefined(grietas) && utils.isDefined(sismo)) {
  series.yield(
    ~~(grietas.value === ATENTA_ESTABILIDAD && sismo.value === NO_SISMO),
    {meta: {grietas, sismo}}
  );
}
