const { getValueFromSingleEvent } = require("common-modules/superation");

const REBALSE_OLA_DEBIDO_ESLIZAMIENTO_YES = + true;  // 1

// Condicion: Evento gatillador: Deslizamiento inminente hacia el interior de la laguna (Evento C)
const eventsDeslizamientoInminente = await series.query({head:
  "*.deslizamiento-inminente.C1"});

// Condicion: Revancha hidráulica: (Evento B1)
const eventsRevanchaHidraulicaB1 = await series.query({head:
  "*.revancha-hidraulica.B1"});

if (
  // Condicion: Evento gatillador: Deslizamiento inminente hacia el interior de la laguna (Evento C)
  utils.isDefined(eventsDeslizamientoInminente) &&
  // Condicion: Revancha hidráulica: (Evento B1)
  utils.isDefined(eventsRevanchaHidraulicaB1)) {
    // Condicion: Evento gatillador: Deslizamiento inminente hacia el interior de la laguna (Evento C)
    const eventDeslizamientoInminenteValue = getValueFromSingleEvent(eventsDeslizamientoInminente,
      "*.deslizamiento-inminente");

    // Condicion: Revancha hidráulica: (Evento B1)
    const eventRevanchaHidraulicaB1Value = getValueFromSingleEvent(eventsRevanchaHidraulicaB1,
      "*.revancha-hidraulica.B1");

    series.yield(
      // Condicion: Evento gatillador: Deslizamiento inminente hacia el interior de la laguna (Evento C)
      eventDeslizamientoInminenteValue == REBALSE_OLA_DEBIDO_ESLIZAMIENTO_YES &&
      // Condicion: Revancha hidráulica: (Evento B1)
      eventRevanchaHidraulicaB1Value == REBALSE_OLA_DEBIDO_ESLIZAMIENTO_YES,
      {meta: {
        // Condicion: Evento gatillador: Deslizamiento inminente hacia el interior de la laguna (Evento C)
        eventsDeslizamientoInminente,
        // Condicion: Revancha hidráulica: (Evento B1)
        eventsRevanchaHidraulicaB1}});
}
else {
    series.yield(false,
      {meta: {
        // Condicion: Evento gatillador: Deslizamiento inminente hacia el interior de la laguna (Evento C)
        eventsDeslizamientoInminente,
        // Condicion: Revancha hidráulica: (Evento B1)
        eventsRevanchaHidraulicaB1}});
}
