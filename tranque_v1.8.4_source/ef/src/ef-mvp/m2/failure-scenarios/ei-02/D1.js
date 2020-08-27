const { cleanArray } = require("common-modules/superation");
const { getValueFromArrayEvents } = require("common-modules/superation");

const EROSION_INTERNA_PRODUCTO_SUBSIDENCIAS_CUBETA_MURO_YES = + true;  // 1

// Condicion: Botón de confirmación manual por operador
let eventsConfirmacionManualD1 = await series.queryAll({head:
  "*.confirmacion-manual-D1"});
eventsConfirmacionManualD1 = cleanArray(eventsConfirmacionManualD1);

// Condicion: Presencia de filtraciones en el muro del depósito: (Evento B2)
let eventsIntegridadExternaSubsidenciaB2 = await series.queryAll({head:
  "*.integridad-externa.subsidencia.B2"});
eventsIntegridadExternaSubsidenciaB2 = cleanArray(eventsIntegridadExternaSubsidenciaB2);

// Condicion: Distancia mínima al muro de la laguna aguas claras: (Evento B1 o superior)
let eventsDistanciaLagunaB2 = await series.queryAll({head:
  "*.distancia-laguna.B2"});
eventsDistanciaLagunaB2 = cleanArray(eventsDistanciaLagunaB2);

let eventsDistanciaLagunaC1 = await series.queryAll({head:
  "*.distancia-laguna.C1"});
eventsDistanciaLagunaC1 = cleanArray(eventsDistanciaLagunaC1);

if (
  // Condicion: Botón de confirmación manual por operador
  utils.isDefined(eventsConfirmacionManualD1) && eventsConfirmacionManualD1.length > 0 &&

  // Condicion: Presencia de filtraciones en el muro del depósito: (Evento C1 o C2)
  utils.isDefined(eventsIntegridadExternaSubsidenciaB2) && eventsIntegridadExternaSubsidenciaB2.length > 0 &&

  // Condicion: Adicionalmente se cumple al menos uno de los siguientes
  utils.isDefined(eventsDistanciaLagunaB2) && eventsDistanciaLagunaB2.length > 0 &&
  utils.isDefined(eventsDistanciaLagunaC1) && eventsDistanciaLagunaC1.length > 0) {
    // Condicion: Botón de confirmación manual por operador
    const eventConfirmacionManualD1Value = getValueFromArrayEvents(eventsConfirmacionManualD1,
      "*.confirmacion-manual-D1");

    // Condicion: Presencia subsidencia o socavón en el muro o cubeta del depósito (PC-11 Evento B2)
    const eventIntegridadExternaSubsidenciaB2Value = getValueFromArrayEvents(eventsIntegridadExternaSubsidenciaB2,
      "*.integridad-externa.subsidencia.B2");

    // Condicion: Distancia mínima al muro de la laguna aguas claras: (Evento B1 o superior)
    const eventDistanciaLagunaB2Value = getValueFromArrayEvents(eventsDistanciaLagunaB2,
      "*.distancia-laguna.B2");
    const eventDistanciaLagunaC1Value = getValueFromArrayEvents(eventsDistanciaLagunaC1,
      "*.distancia-laguna.C1");
  series.yield(
    // Condicion: Botón de confirmación manual por operador
    eventConfirmacionManualD1Value == EROSION_INTERNA_PRODUCTO_SUBSIDENCIAS_CUBETA_MURO_YES &&
    // Condicion: Presencia subsidencia o socavón en el muro o cubeta del depósito (PC-11 Evento B2)
    eventIntegridadExternaSubsidenciaB2Value == EROSION_INTERNA_PRODUCTO_SUBSIDENCIAS_CUBETA_MURO_YES &&
    // Condicion: Distancia mínima al muro de la laguna aguas claras: (Evento B1 o superior)
    eventDistanciaLagunaB2Value == EROSION_INTERNA_PRODUCTO_SUBSIDENCIAS_CUBETA_MURO_YES &&
    eventDistanciaLagunaC1Value == EROSION_INTERNA_PRODUCTO_SUBSIDENCIAS_CUBETA_MURO_YES,
    {meta: {
      // Condicion: Botón de confirmación manual por operador
      eventsConfirmacionManualD1,
      // Condicion: Presencia subsidencia o socavón en el muro o cubeta del depósito (PC-11 Evento B2)
      eventsIntegridadExternaSubsidenciaB2,
      // Condicion: Distancia mínima al muro de la laguna aguas claras: (Evento B1 o superior)
      eventsDistanciaLagunaB2, eventsDistanciaLagunaC1}});
}
else {
  series.yield(false,
    {meta: {
      // Condicion: Botón de confirmación manual por operador
      eventsConfirmacionManualD1,
      // Condicion: Presencia subsidencia o socavón en el muro o cubeta del depósito (PC-11 Evento B2)
      eventsIntegridadExternaSubsidenciaB2,
      // Condicion: Distancia mínima al muro de la laguna aguas claras: (Evento B1 o superior)
      eventsDistanciaLagunaB2, eventsDistanciaLagunaC1}});
}
