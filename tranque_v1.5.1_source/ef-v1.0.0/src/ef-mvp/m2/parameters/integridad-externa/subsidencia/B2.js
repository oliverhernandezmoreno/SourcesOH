const CUBETA = 1;

const subsidencia_cubeta = await series.query({head: "*.subsidencia-cubeta"});

if (utils.isDefined(subsidencia_cubeta)) {
  series.yield(
    ~~(subsidencia_cubeta.value === CUBETA),
    {meta: {subsidencia_cubeta}}
  )
}
