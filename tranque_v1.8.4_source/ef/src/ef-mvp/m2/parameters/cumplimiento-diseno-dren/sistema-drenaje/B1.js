const SIN_INFORMACION_YES = + true;  // 1

const last = await series.query({head: "*.sin-informacion"});

if (utils.isDefined(last))
  series.yield(last.value === SIN_INFORMACION_YES, {meta: {last}})
