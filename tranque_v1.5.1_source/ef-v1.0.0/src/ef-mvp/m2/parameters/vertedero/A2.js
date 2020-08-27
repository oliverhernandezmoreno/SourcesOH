const COTA_VERTEDERO_YES = + true;  // 1

const last = await series.query({head: "*.cota-vertedero"});

if (utils.isDefined(last))
  series.yield(last.value === COTA_VERTEDERO_YES, {meta: {last}})
