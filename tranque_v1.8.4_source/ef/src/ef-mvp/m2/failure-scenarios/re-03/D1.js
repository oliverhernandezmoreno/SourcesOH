const { getValueFromArrayEvents } = require("common-modules/superation");

const REBALSE_RELAVES_PRODUCTO_LICUEFACCION_CUBETA_YES = + true;  // 1

// Revancha operacional: Evento A2
const eventsRevanchaOperacionalA2 = await series.queryAll({head:
  "*.revancha-operacional.sector.A2"});

// Pendiente de playa: Evento B1
const eventsPendientePlayaB1 = await series.queryAll({head:
  "*.pendiente-playa.sector.B1"});

const eventsPendientePlayaB2 = await series.queryAll({head:
  "*.pendiente-playa.sector.B2"});

// Nivel freático en la cubeta: Evento B1
const eventsNivelFreaticoCubetaDepositoB1 = await series.queryAll({head:
  "*.nivel-freatico-cubeta-deposito.B1"});

// Evento D1: (Por confirmación manual)
const eventsConfirmacionManualD1 = await series.queryAll({head:
  "*.confirmacion-manual-D1"});

if (
  // Revancha operacional: Evento A2
  utils.isDefined(eventsRevanchaOperacionalA2) &&
  // Pendiente de playa: Evento B1
  utils.isDefined(eventsPendientePlayaB1) &&
  utils.isDefined(eventsPendientePlayaB2) &&
  // Nivel freático en la cubeta: Evento B1
  utils.isDefined(eventsNivelFreaticoCubetaDepositoB1) &&
  // Evento D1: (Por confirmación manual)
  utils.isDefined(eventsConfirmacionManualD1)) {
    // Condicion: Evento gatillador: Lluvia en desarrollo (Evento B)
    const eventRevanchaOperacionalA2Value = getValueFromArrayEvents(eventsRevanchaOperacionalA2,
      "*.revancha-operacional.sector.A2");

    // Pendiente de playa: Evento B1Pendiente de playa: Evento B1
    const eventPendientePlayaB1Value = getValueFromArrayEvents(eventsPendientePlayaB1,
      "*.pendiente-playa.sector.B1");
    const eventPendientePlayaB2Value = getValueFromArrayEvents(eventsPendientePlayaB2,
      "*.pendiente-playa.sector.B2");

    // Condicion: Evento gatillador: Lluvia en desarrollo (Evento B)
    const eventNivelFreaticoCubetaDepositoB1Value = getValueFromArrayEvents(eventsNivelFreaticoCubetaDepositoB1,
      "*.nivel-freatico-cubeta-deposito.B1");

    // Evento D1: (Por confirmación manual)
    const eventConfirmacionManualD1Value = getValueFromArrayEvents(eventsConfirmacionManualD1,
      "*.confirmacion-manual-D1");

    series.yield(
      // Revancha operacional: Evento A2
      eventRevanchaOperacionalA2Value == REBALSE_RELAVES_PRODUCTO_LICUEFACCION_CUBETA_YES &&
      // Pendiente de playa: Evento B1Pendiente de playa: Evento B1
      eventPendientePlayaB1Value == REBALSE_RELAVES_PRODUCTO_LICUEFACCION_CUBETA_YES &&
      eventPendientePlayaB2Value == REBALSE_RELAVES_PRODUCTO_LICUEFACCION_CUBETA_YES &&
      // Nivel freático en la cubeta: Evento B1
      eventNivelFreaticoCubetaDepositoB1Value == REBALSE_RELAVES_PRODUCTO_LICUEFACCION_CUBETA_YES &&
      // Revancha operacional: Evento A2
      eventConfirmacionManualD1Value == REBALSE_RELAVES_PRODUCTO_LICUEFACCION_CUBETA_YES,
      {meta: {
        eventsRevanchaOperacionalA2,
        eventsPendientePlayaB1,
        eventsPendientePlayaB2,
        eventsNivelFreaticoCubetaDepositoB1,
        eventsConfirmacionManualD1}});
}
else {
    series.yield(false,
      {meta: {
        eventsRevanchaOperacionalA2,
        eventsPendientePlayaB1,
        eventsPendientePlayaB2,
        eventsNivelFreaticoCubetaDepositoB1,
        eventsConfirmacionManualD1}});
}
