const RIESGO_INTEGRIDAD = 1;
const NO_SISMO = 0;

const filtraciones = await series.query({head: "*.inputs.filtraciones"});
const sismo = await series.query({head: "*.sismo"});


if (utils.isDefined(filtraciones) && utils.isDefined(sismo)) {
  series.yield(
    ~~(filtraciones.value === RIESGO_INTEGRIDAD && sismo.value === NO_SISMO),
    {meta: {filtraciones, sismo}}
  );
}
