const DETECTA_C2_YES = + true;  // 1

const last = await series.query({head: "*.detecta-C2"});

if (utils.isDefined(last))
  series.yield(last.value === DETECTA_C2_YES, {meta: {last}})
