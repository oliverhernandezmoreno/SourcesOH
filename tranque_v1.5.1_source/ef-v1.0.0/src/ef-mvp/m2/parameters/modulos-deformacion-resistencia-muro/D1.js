const DETECTA_D1_YES = + true;  // 1

const last = await series.query({head: "*.detecta-D1"});

if (utils.isDefined(last))
  series.yield(last.value === DETECTA_D1_YES, {meta: {last}})
