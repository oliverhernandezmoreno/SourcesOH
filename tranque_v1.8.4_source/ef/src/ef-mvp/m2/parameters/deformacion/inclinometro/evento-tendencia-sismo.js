const TENDENCIA = 1;
const SISMO = 1;

const tendencia = await series.query({head: "*.B*"});
const sismo = await series.query({head: "*.sismo"});

if (utils.isDefined(tendencia) && utils.isDefined(sismo)) {
  series.yield(
    ~~(tendencia.value === TENDENCIA && sismo.value === SISMO),
    {meta: {tendencia, sismo}}
  );
}
