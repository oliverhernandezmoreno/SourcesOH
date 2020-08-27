const REBALSE_PERDIDA_REVANCHA_HIDRAULICA_LLUVIA_INTENSA_YES = + true;  // 1

const lastRebalseC1 = await series.query({head: "*.re-01.C1"});
const lastPotencialRebalseB3 = await series.query({head: "*.potencial-rebalse.B3"});

if (utils.isDefined(lastRebalseC1) && utils.isDefined(lastPotencialRebalseB3)) {
  series.yield(lastRebalseC1.value == REBALSE_PERDIDA_REVANCHA_HIDRAULICA_LLUVIA_INTENSA_YES &&
    lastPotencialRebalseB3.value == REBALSE_PERDIDA_REVANCHA_HIDRAULICA_LLUVIA_INTENSA_YES,
    {meta: {lastRebalseC1, lastPotencialRebalseB3}});
}
else {
  series.yield(false, {meta: {lastRebalseC1, lastPotencialRebalseB3}});
}
