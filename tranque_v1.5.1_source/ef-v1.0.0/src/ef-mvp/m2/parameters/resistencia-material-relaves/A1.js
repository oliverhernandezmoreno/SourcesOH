const PROPIEDADES_RESISTENTES_YES = + true;  // 1

const last = await series.query({head: "*.propiedades-resistentes"});

if (utils.isDefined(last))
  series.yield(last.value === PROPIEDADES_RESISTENTES_YES, {meta: {last}})
