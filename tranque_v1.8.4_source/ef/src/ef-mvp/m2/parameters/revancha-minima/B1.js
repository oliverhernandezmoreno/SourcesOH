const DOCUMENTO_NO_EXISTE_YES = + true;  // 1

const last = await series.query({head: "*.documento-no-existe"});

if (utils.isDefined(last))
  series.yield(last.value === DOCUMENTO_NO_EXISTE_YES, {meta: {last}})
