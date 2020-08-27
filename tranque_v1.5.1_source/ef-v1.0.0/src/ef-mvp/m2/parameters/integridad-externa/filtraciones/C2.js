const RIESGO_INTEGRIDAD = 1;
const SISMO = 1;

const filtraciones = await series.query({head: "*.inputs.filtraciones"});
const sismo = await series.query({head: "*.sismo"});


if (utils.isDefined(filtraciones) && utils.isDefined(sismo)) {
  series.yield(
    ~~(filtraciones.value === RIESGO_INTEGRIDAD && sismo.value === SISMO),
    {meta: {filtraciones, sismo}}
  );
}
