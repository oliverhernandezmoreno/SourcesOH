const { cleanArray } = require("common-modules/superation");
const { getValueFromArrayEvents } = require("common-modules/superation");

const REBALSE_PERDIDA_REVANCHA_HIDRAULICA_LLUVIA_INTENSA_YES = + true;  // 1

// Condicion: Evento gatillador: Lluvia en desarrollo (Evento B)
let eventsLluviaB1 = await series.queryAll({head: "*.lluvia"});
eventsLluviaB1 = cleanArray(eventsLluviaB1);

// Condicion: Revancha hidráulica: (Evento B1)
let eventsRevanchaHidraulicaB1 = await series.queryAll({head: "*.revancha-hidraulica.B1"});
eventsRevanchaHidraulicaB1 = cleanArray(eventsRevanchaHidraulicaB1);

// Condicion: Potencial de rebalse: (Evento B4)
let eventsPotencialRebalseB4 = await series.queryAll({head: "*.potencial-rebalse.B4"});
eventsPotencialRebalseB4 = cleanArray(eventsPotencialRebalseB4);

// Condicion: Potencial de rebalse: (Evento B3)
let eventsPotencialRebalseB3 = await series.queryAll({head: "*.potencial-rebalse.B3"});
eventsPotencialRebalseB3 = cleanArray(eventsPotencialRebalseB3);

if (
  // Condicion: Evento gatillador: Lluvia en desarrollo (Evento B)
  utils.isDefined(eventsLluviaB1) &&
  // Condicion: Revancha hidráulica: (Evento B1)
  utils.isDefined(eventsRevanchaHidraulicaB1) &&
  // Condicion: Potencial de rebalse: (Evento B4)
  utils.isDefined(eventsPotencialRebalseB4) &&
  // Condicion: Potencial de rebalse: (Evento B3)
  utils.isDefined(eventsPotencialRebalseB3)) {
  // Condicion: Evento gatillador: Lluvia en desarrollo (Evento B)
  const eventLluviaB1Value = getValueFromArrayEvents(eventsLluviaB1, "*.lluvia");

  // Condicion: Revancha hidráulica: (Evento B1)
  const eventRevanchaHidraulicaB1Value = getValueFromArrayEvents(eventsRevanchaHidraulicaB1, "*.revancha-hidraulica.B1");

  // Condicion: Potencial de rebalse: (Evento B4)
  const eventPotencialRebalseB4Value = getValueFromArrayEvents(eventsPotencialRebalseB4, "*.potencial-rebalse.B4");

  // Condicion: Potencial de rebalse: (Evento B3)
  const eventPotencialRebalseB3Value = getValueFromArrayEvents(eventsPotencialRebalseB3, "*.potencial-rebalse.B3");

  series.yield(
    // Condicion: Evento gatillador: Lluvia en desarrollo (Evento B)
    eventLluviaB1Value == REBALSE_PERDIDA_REVANCHA_HIDRAULICA_LLUVIA_INTENSA_YES &&
    // Condicion: Revancha hidráulica: (Evento B1)
    eventRevanchaHidraulicaB1Value == REBALSE_PERDIDA_REVANCHA_HIDRAULICA_LLUVIA_INTENSA_YES &&
    // Condicion: Potencial de rebalse: (Evento B4)
    eventPotencialRebalseB4Value == REBALSE_PERDIDA_REVANCHA_HIDRAULICA_LLUVIA_INTENSA_YES &&
    // Condicion: Potencial de rebalse: (Evento B3)
    eventPotencialRebalseB3Value == REBALSE_PERDIDA_REVANCHA_HIDRAULICA_LLUVIA_INTENSA_YES,
    {meta: {
      // Condicion: Evento gatillador: Lluvia en desarrollo (Evento B)
      eventsLluviaB1,
      // Condicion: Revancha hidráulica: (Evento B1)
      eventsRevanchaHidraulicaB1,
      // Condicion: Potencial de rebalse: (Evento B3)
      eventsPotencialRebalseB3,
      // Condicion: Potencial de rebalse: (Evento B4)
      eventsPotencialRebalseB4}});
}
else {
  series.yield(false,
    {meta: {
      // Condicion: Evento gatillador: Lluvia en desarrollo (Evento B)
      eventsLluviaB1,
      // Condicion: Revancha hidráulica: (Evento B1)
      eventsRevanchaHidraulicaB1,
      // Condicion: Potencial de rebalse: (Evento B3)
      eventsPotencialRebalseB3,
      // Condicion: Potencial de rebalse: (Evento B4)
      eventsPotencialRebalseB4}});
}
