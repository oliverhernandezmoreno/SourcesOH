const ATENTA_ESTABILIDAD = 1;
const SISMO = 1;

const grietas = await series.query({head: "*.inputs.grietas"});
const sismo = await series.query({head: "*.sismo"});

if (utils.isDefined(grietas) && utils.isDefined(sismo)) {
  series.yield(
    ~~(grietas.value === ATENTA_ESTABILIDAD && sismo.value === SISMO),
    {meta: {grietas, sismo}}
  );
}
