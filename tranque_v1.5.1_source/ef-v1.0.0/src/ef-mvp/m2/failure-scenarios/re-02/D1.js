const REBALSE_OLA_DEBIDO_ESLIZAMIENTO_YES = + true;  // 1

const lastDeslizamientoInminente = await series.query({head: "*.deslizamiento-inminente"});
const lastConfirmacionManualD1 = await series.query({head: "*.confirmacion-manual-D1"});

if (utils.isDefined(lastDeslizamientoInminente) && utils.isDefined(lastConfirmacionManualD1)) {
  series.yield(lastDeslizamientoInminente.value == REBALSE_OLA_DEBIDO_ESLIZAMIENTO_YES &&
    lastConfirmacionManualD1.value == REBALSE_OLA_DEBIDO_ESLIZAMIENTO_YES,
    {meta: {lastDeslizamientoInminente, lastConfirmacionManualD1}});
}
else {
  series.yield(false, {meta: {lastDeslizamientoInminente, lastConfirmacionManualD1}});
}
