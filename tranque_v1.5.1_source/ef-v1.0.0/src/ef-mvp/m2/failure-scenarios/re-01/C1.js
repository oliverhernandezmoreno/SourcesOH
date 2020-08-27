const REBALSE_PERDIDA_REVANCHA_HIDRAULICA_LLUVIA_INTENSA_YES = + true;  // 1

const lastLluviaB1 = await series.query({head: "*.lluvia.B1"});
const lastRevanchaHidraulicaB1 = await series.query({head: "*.revancha-hidraulica.B1"});
const lastPotencialRebalseB4 = await series.query({head: "*.potencial-rebalse.B4"});

if (utils.isDefined(lastLluviaB1) && utils.isDefined(lastRevanchaHidraulicaB1) && utils.isDefined(lastPotencialRebalseB4)) {
  series.yield(lastLluviaB1.value == REBALSE_PERDIDA_REVANCHA_HIDRAULICA_LLUVIA_INTENSA_YES &&
    lastRevanchaHidraulicaB1.value == REBALSE_PERDIDA_REVANCHA_HIDRAULICA_LLUVIA_INTENSA_YES &&
    lastPotencialRebalseB4.value == REBALSE_PERDIDA_REVANCHA_HIDRAULICA_LLUVIA_INTENSA_YES,
    {meta: {lastLluviaB1, lastRevanchaHidraulicaB1, lastPotencialRebalseB4}});
}
else {
  series.yield(false, {meta: {lastLluviaB1, lastRevanchaHidraulicaB1, lastPotencialRebalseB4}});
}
