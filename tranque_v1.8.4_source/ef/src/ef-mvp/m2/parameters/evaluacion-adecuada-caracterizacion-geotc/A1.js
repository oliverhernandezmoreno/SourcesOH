const VALIDADO_YES = + true;  // 1

const last = await series.query({head: "*.validado"});

if (utils.isDefined(last))
  series.yield(last.value === VALIDADO_YES, {meta: {last}})
