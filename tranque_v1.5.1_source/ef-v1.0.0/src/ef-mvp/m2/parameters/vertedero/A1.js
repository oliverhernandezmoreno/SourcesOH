const VERTEDERO_NO_OPERATIVO_YES = + true;  // 1

const last = await series.query({head: "*.vertedero-no-operativo"});

if (utils.isDefined(last))
  series.yield(last.value === VERTEDERO_NO_OPERATIVO_YES, {meta: {last}})
