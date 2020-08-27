const RIESGO_INTEGRIDAD = 1;
const SISMO = 1;

const subsidencia = await series.query({head: "*.inputs.subsidencia"});
const sismo = await series.query({head: "*.sismo"});


if (utils.isDefined(subsidencia) && utils.isDefined(sismo)) {
  series.yield(
    ~~(subsidencia.value === RIESGO_INTEGRIDAD && sismo.value === SISMO),
    {meta: {subsidencia, sismo}}
  );
}
