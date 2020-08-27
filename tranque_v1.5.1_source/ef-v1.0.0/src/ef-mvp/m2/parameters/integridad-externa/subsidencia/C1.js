const SUBSIDENCIA_RIEGOSA = 1;
const SISMO = 0;  // without

const subsidencia = await series.query({head: "*.subsidencia"});
const sismo = await series.query({head: "*.sismo"});

if (utils.isDefined(subsidencia) && utils.isDefined(sismo)) {
  series.yield(
    ~~(subsidencia.value === SUBSIDENCIA_RIEGOSA &&
    sismo.value === SISMO),
    {meta: {subsidencia, sismo}}
  )
}
