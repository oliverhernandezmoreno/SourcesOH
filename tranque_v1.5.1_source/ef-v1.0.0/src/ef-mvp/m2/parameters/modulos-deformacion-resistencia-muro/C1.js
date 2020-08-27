const { getCountCumpleCriteria } = require("common-modules/superation");

const MODULOS_DEFORMACION_RESITENCIA_C1_YES = + true;  // 1

let alfaValue = undefined;
const alfa = await refs.param("alfa-modulos-deformacion-resistencia-muro");
if (utils.isDefined(alfa) && utils.isDefined(alfa.value)) {
  alfaValue = alfa.value;
}
else {
  alfaValue = 2940; // minutes = 25 hours
}

const eventsDetectaB1 = await series.query({
  slice: "*.detecta-B1",
  since: utils.minutesAgo(ctx.timeframe.end, alfaValue)
});
const countCumpleCriteria = getCountCumpleCriteria(MODULOS_DEFORMACION_RESITENCIA_C1_YES, eventsDetectaB1, alfaValue);

series.yield(countCumpleCriteria >= 49, {meta: countCumpleCriteria});
