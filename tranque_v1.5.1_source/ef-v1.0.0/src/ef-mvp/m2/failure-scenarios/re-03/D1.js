const REBALSE_RELAVES_PRODUCTO_LICUEFACCION_CUBETA_YES = + true;  // 1

const lastConfirmacionManualD1 = await series.query({head: "*.confirmacion-manual-D1"});
const lastRe03C1 = await series.query({head: "*.re-03.C1"});

if (utils.isDefined(lastConfirmacionManualD1) && utils.isDefined(lastRe03C1)) {
  series.yield(lastConfirmacionManualD1.value == REBALSE_RELAVES_PRODUCTO_LICUEFACCION_CUBETA_YES &&
    lastRe03C1.value == REBALSE_RELAVES_PRODUCTO_LICUEFACCION_CUBETA_YES,
    {meta: {lastConfirmacionManualD1, lastRe03C1}});
}
else {
  series.yield(false, {meta: {lastConfirmacionManualD1, lastRe03C1}});
}
