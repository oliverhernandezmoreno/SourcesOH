const REBALSE_RELAVES_PRODUCTO_LICUEFACCION_CUBETA_YES = + true;  // 1

const lastRevanchaOperacionalA2 = await series.queryAll({head: "*.revancha-operacional.A2"});
const lastPendientePlayaB1 = await series.queryAll({head: "*.pendiente-playa.B1"});
const lastNivelFreaticoCubetaDepositoB1 = await series.queryAll({head: "*.nivel-freatico-cubeta-deposito.B1"});

if (utils.isDefined(lastRevanchaOperacionalA2) &&
  utils.isDefined(lastPendientePlayaB1) &&
  utils.isDefined(lastNivelFreaticoCubetaDepositoB1)) {
  series.yield(lastRevanchaOperacionalA2[0].value == REBALSE_RELAVES_PRODUCTO_LICUEFACCION_CUBETA_YES &&
    lastPendientePlayaB1[0].value == REBALSE_RELAVES_PRODUCTO_LICUEFACCION_CUBETA_YES &&
    lastNivelFreaticoCubetaDepositoB1[0].value == REBALSE_RELAVES_PRODUCTO_LICUEFACCION_CUBETA_YES,
    {meta: {lastRevanchaOperacionalA2, lastPendientePlayaB1, lastNivelFreaticoCubetaDepositoB1}});
}
else {
  series.yield(false, {meta: {lastRevanchaOperacionalA2, lastPendientePlayaB1, lastNivelFreaticoCubetaDepositoB1}});
}
