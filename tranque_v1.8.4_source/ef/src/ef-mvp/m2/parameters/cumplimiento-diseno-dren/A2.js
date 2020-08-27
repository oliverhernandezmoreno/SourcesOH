const INFORMACION_PARCIAL_YES = + true;  // 1

const last = await series.query({head: "*.informacion-parcial"});

if (utils.isDefined(last))
  series.yield(last.value === INFORMACION_PARCIAL_YES, {meta: {last}})
