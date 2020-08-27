const DETECTA_B1_YES = + true;  // 1

const last = await series.query({head: "*.detecta-B1"});

if (utils.isDefined(last))
  series.yield(last.value === DETECTA_B1_YES, {meta: {last}})
