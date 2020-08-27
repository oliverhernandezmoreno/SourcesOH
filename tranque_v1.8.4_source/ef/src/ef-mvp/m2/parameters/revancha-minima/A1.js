  const DOCUMENTO_REQUIERE_ACTUALIZACION_YES = + true;  // 1

const last = await series.query({head: "*.documento-requiere-actualizacion"});

if (utils.isDefined(last))
  series.yield(last.value === DOCUMENTO_REQUIERE_ACTUALIZACION_YES, {meta: {last}})
