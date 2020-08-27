const REBALSE_OLA_DEBIDO_ESLIZAMIENTO_YES = + true;  // 1

const lastDeslizamientoInminente = await series.query({head: "*.deslizamiento-inminente"});
const lastRevanchaHidraulicaB1 = await series.query({head: "*.revancha-hidraulica.B1"});

if (utils.isDefined(lastDeslizamientoInminente) && utils.isDefined(lastRevanchaHidraulicaB1)) {
  series.yield(lastDeslizamientoInminente.value == REBALSE_OLA_DEBIDO_ESLIZAMIENTO_YES &&
    lastRevanchaHidraulicaB1.value == REBALSE_OLA_DEBIDO_ESLIZAMIENTO_YES,
    {meta: {lastDeslizamientoInminente, lastRevanchaHidraulicaB1}});
}
else {
  series.yield(false, {meta: {lastDeslizamientoInminente, lastRevanchaHidraulicaB1}});
}
