const DETECTA_B2_YES = + true;  // 1

const last = await series.query({head: "*.detecta-B2"});

if (utils.isDefined(last))
  series.yield(last.value === DETECTA_B2_YES, {meta: {last}})
