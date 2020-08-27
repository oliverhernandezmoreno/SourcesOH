const MURO = 1;

const subsidencia_muro = await series.query({head: "*.subsidencia-muro"});

if (utils.isDefined(subsidencia_muro)) {
  series.yield(
    ~~(subsidencia_muro.value === MURO),
    {meta: {subsidencia_muro}}
  )
}
