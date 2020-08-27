const { cleanArray } = require("common-modules/superation");
const { getValueFromArrayEvents, getValueFromSingleEvent } = require("common-modules/superation");

const INESTABILIDAD_POR_EROSION_INTERNA_PRODUCTO_APARICION_SUBSIDENCIAS_MURO_YES = + true;  // 1

// Condicion: Presencia de subsidencia o socavón en el muro o cubeta del depósito: (Evento C1 o C2)
let eventsIntegridadExternaSubsidenciaC1 = await series.queryAll({head:
  "*.integridad-externa.subsidencia.C1"});
eventsIntegridadExternaSubsidenciaC1 = cleanArray(eventsIntegridadExternaSubsidenciaC1);

let eventsIntegridadExternaSubsidenciaC2 = await series.queryAll({head:
  "*.integridad-externa.subsidencia.C2"});
eventsIntegridadExternaSubsidenciaC2 = cleanArray(eventsIntegridadExternaSubsidenciaC2);

// Condicion: Distancia mínima al muro de la laguna aguas claras: (Evento B1 o superior)
let eventsDistanciaLagunaB2 = await series.queryAll({head: "*.distancia-laguna.B2"});
eventsDistanciaLagunaB2 = cleanArray(eventsDistanciaLagunaB2);

let eventsDistanciaLagunaC1 = await series.queryAll({head: "*.distancia-laguna.C1"});
eventsDistanciaLagunaC1 = cleanArray(eventsDistanciaLagunaC1);

// Condicion: Presión de poros: (Evento B5 o superior)
let eventsPresionPorosB51 = await series.queryAll({head: "*.B5-1"});
eventsPresionPorosB51 = cleanArray(eventsPresionPorosB51);

let eventsPresionPorosB52 = await series.queryAll({head: "*.B5-2"});
eventsPresionPorosB52 = cleanArray(eventsPresionPorosB52);

let eventsPresionPorosB53 = await series.queryAll({head: "*.B5-3"});
eventsPresionPorosB53 = cleanArray(eventsPresionPorosB53);

let eventsPresionPorosB54 = await series.queryAll({head: "*.B5-4"});
eventsPresionPorosB54 = cleanArray(eventsPresionPorosB54);

let eventsPresionPorosB61 = await series.queryAll({head: "*.B6-1"});
eventsPresionPorosB61 = cleanArray(eventsPresionPorosB61);

let eventsPresionPorosB62 = await series.queryAll({head: "*.B6-2"});
eventsPresionPorosB62 = cleanArray(eventsPresionPorosB62);

let eventsPresionPorosB63 = await series.queryAll({head: "*.B6-3"});
eventsPresionPorosB63 = cleanArray(eventsPresionPorosB63);

let eventsPresionPorosC11 = await series.queryAll({head: "*.C1-1"});
eventsPresionPorosC11 = cleanArray(eventsPresionPorosC11);

let eventsPresionPorosC12 = await series.queryAll({head: "*.C1-2"});
eventsPresionPorosC12 = cleanArray(eventsPresionPorosC12);

let eventsPresionPorosC13 = await series.queryAll({head: "*.C1-3"});
eventsPresionPorosC12 = cleanArray(eventsPresionPorosC12);

let eventsPresionPorosC14 = await series.queryAll({head: "*.C1-4"});
eventsPresionPorosC12 = cleanArray(eventsPresionPorosC12);

let eventsPresionPorosC15 = await series.queryAll({head: "*.C1-5"});
eventsPresionPorosC15 = cleanArray(eventsPresionPorosC15);

let eventsPresionPorosC21 = await series.queryAll({head: "*.C2-1"});
eventsPresionPorosC21 = cleanArray(eventsPresionPorosC21);

let eventsPresionPorosC22 = await series.queryAll({head: "*.C2-2"});
eventsPresionPorosC22 = cleanArray(eventsPresionPorosC22);

let eventsPresionPorosD1 = await series.queryAll({head: "*.D1"});
eventsPresionPorosD1 = cleanArray(eventsPresionPorosD1);

let eventsPresionPorosD2 = await series.queryAll({head: "*.D2"});
eventsPresionPorosD2 = cleanArray(eventsPresionPorosD2);

// Condicion: Turbiedad en el sistema de drenaje: (Evento B1, B2 o B3)
let eventsTurbiedadB3 = await series.queryAll({head: "*.turbiedad.B3"});
eventsTurbiedadB3 = cleanArray(eventsTurbiedadB3);

// Condicion: Presencia de grietas en el muro del depósito: (Evento C1 o C2)
const eventsGrietasC1 = await series.queryAll({head: "*.integridad-externa.grietas.C1"});

const eventsGrietasC2 = await series.queryAll({head: "*.integridad-externa.grietas.C2"});

if (
  // Condicion: Presencia de subsidencia o socavón en el muro o cubeta del depósito: (Evento C1 o C2)
  utils.isDefined(eventsIntegridadExternaSubsidenciaC1) &&
  utils.isDefined(eventsIntegridadExternaSubsidenciaC2) &&

  // Condicion: Distancia mínima al muro de la laguna aguas claras: (Evento B1 o superior)
  utils.isDefined(eventsDistanciaLagunaB2) &&
  utils.isDefined(eventsDistanciaLagunaC1) &&

  // Condicion: Presiones de poros: (Protocolo B5 o superior)
  utils.isDefined(eventsPresionPorosB51) &&
  utils.isDefined(eventsPresionPorosB52) &&
  utils.isDefined(eventsPresionPorosB53) &&
  utils.isDefined(eventsPresionPorosB54) &&
  utils.isDefined(eventsPresionPorosB61) &&
  utils.isDefined(eventsPresionPorosB62) &&
  utils.isDefined(eventsPresionPorosB63) &&
  utils.isDefined(eventsPresionPorosC11) &&
  utils.isDefined(eventsPresionPorosC12) &&
  utils.isDefined(eventsPresionPorosC13) &&
  utils.isDefined(eventsPresionPorosC14) &&
  utils.isDefined(eventsPresionPorosC15) &&
  utils.isDefined(eventsPresionPorosC21) &&
  utils.isDefined(eventsPresionPorosC22) &&
  utils.isDefined(eventsPresionPorosD1) &&
  utils.isDefined(eventsPresionPorosD2) &&

  // Condicion: Turbiedad en el sistema de drenaje: (B3)
  utils.isDefined(eventsTurbiedadB3) &&

  // Condicion: Presencia de grietas en el muro del depósito: (Evento C1 o C2)
  utils.isDefined(eventsGrietasC1) &&
  utils.isDefined(eventsGrietasC2)) {
    // Condicion: Presencia de subsidencia o socavón en el muro o cubeta del depósito: (Evento C1 o C2)
    let eventIntegridadExternaSubsidenciaC1Value = getValueFromArrayEvents(eventsIntegridadExternaSubsidenciaC1,
      "*.integridad-externa.subsidencia.C1");
    let eventIntegridadExternaSubsidenciaC2Value = getValueFromArrayEvents(eventsIntegridadExternaSubsidenciaC2,
      "*.integridad-externa.subsidencia.C2");

    // Condicion: Distancia mínima al muro de la laguna aguas claras: (Evento B1 o superior)
    let eventDistanciaLagunaB2Value = getValueFromArrayEvents(eventsDistanciaLagunaB2,
      "*.distancia-laguna.B2");
    let eventDistanciaLagunaC1Value = getValueFromArrayEvents(eventsDistanciaLagunaC1,
      "*.distancia-laguna.C1");

    // Condicion: Presión de poros: (Evento B5 o superior)
    let eventPresionPorosB51Value = getValueFromArrayEvents(eventsPresionPorosB51, "*.B5-1");
    let eventPresionPorosB52Value = getValueFromArrayEvents(eventsPresionPorosB52, "*.B5-2");
    let eventPresionPorosB53Value = getValueFromArrayEvents(eventsPresionPorosB53, "*.B5-3");
    let eventPresionPorosB54Value = getValueFromArrayEvents(eventsPresionPorosB54, "*.B5-4");
    let eventPresionPorosB61Value = getValueFromArrayEvents(eventsPresionPorosB61, "*.B6-1");
    let eventPresionPorosB62Value = getValueFromArrayEvents(eventsPresionPorosB62, "*.B6-2");
    let eventPresionPorosB63Value = getValueFromArrayEvents(eventsPresionPorosB63, "*.B6-3");
    let eventPresionPorosC11Value = getValueFromArrayEvents(eventsPresionPorosB63, "*.C1-1");
    let eventPresionPorosC12Value = getValueFromArrayEvents(eventsPresionPorosB63, "*.C1-2");
    let eventPresionPorosC13Value = getValueFromArrayEvents(eventsPresionPorosB63, "*.C1-3");
    let eventPresionPorosC14Value = getValueFromArrayEvents(eventsPresionPorosB63, "*.C1-4");
    let eventPresionPorosC15Value = getValueFromArrayEvents(eventsPresionPorosB63, "*.C1-5");
    let eventPresionPorosC21Value = getValueFromArrayEvents(eventsPresionPorosB63, "*.C2-1");
    let eventPresionPorosC22Value = getValueFromArrayEvents(eventsPresionPorosB63, "*.C2-2");
    let eventPresionPorosD1Value = getValueFromArrayEvents(eventsPresionPorosB63, "*.D1");
    let eventPresionPorosD2Value = getValueFromArrayEvents(eventsPresionPorosB63, "*.D2");

    // Condicion: Turbiedad en el sistema de drenaje: (B3)
    const eventTurbiedadB3Value = getValueFromArrayEvents(eventsTurbiedadB3, "*.turbiedad.B3");

    // Condicion: Presencia de grietas en el muro del depósito: (Evento C1 o C2)
    const eventGrietasC1Value = getValueFromSingleEvent(eventsGrietasC1,
      "*.integridad-externa.grietas.C1");
    const eventGrietasC2Value = getValueFromSingleEvent(eventsGrietasC2,
      "*.integridad-externa.grietas.C2");
  series.yield(
      // Condicion: Presencia de subsidencia o socavón en el muro o cubeta del depósito: (Evento C1 o C2)
      (eventIntegridadExternaSubsidenciaC1Value == INESTABILIDAD_POR_EROSION_INTERNA_PRODUCTO_APARICION_SUBSIDENCIAS_MURO_YES &&
      eventIntegridadExternaSubsidenciaC2Value == INESTABILIDAD_POR_EROSION_INTERNA_PRODUCTO_APARICION_SUBSIDENCIAS_MURO_YES) ||
      // Condicion: Distancia mínima al muro de la laguna aguas claras: (Evento B1 o superior)
      eventDistanciaLagunaB2Value == INESTABILIDAD_POR_EROSION_INTERNA_PRODUCTO_APARICION_SUBSIDENCIAS_MURO_YES ||
      eventDistanciaLagunaC1Value == INESTABILIDAD_POR_EROSION_INTERNA_PRODUCTO_APARICION_SUBSIDENCIAS_MURO_YES ||
      // Condicion: Presión de poros: (Evento B5 o superior)
      eventPresionPorosB51Value == INESTABILIDAD_POR_EROSION_INTERNA_PRODUCTO_APARICION_SUBSIDENCIAS_MURO_YES ||
      eventPresionPorosB52Value == INESTABILIDAD_POR_EROSION_INTERNA_PRODUCTO_APARICION_SUBSIDENCIAS_MURO_YES ||
      eventPresionPorosB53Value == INESTABILIDAD_POR_EROSION_INTERNA_PRODUCTO_APARICION_SUBSIDENCIAS_MURO_YES ||
      eventPresionPorosB54Value == INESTABILIDAD_POR_EROSION_INTERNA_PRODUCTO_APARICION_SUBSIDENCIAS_MURO_YES ||
      eventPresionPorosB61Value == INESTABILIDAD_POR_EROSION_INTERNA_PRODUCTO_APARICION_SUBSIDENCIAS_MURO_YES ||
      eventPresionPorosB62Value == INESTABILIDAD_POR_EROSION_INTERNA_PRODUCTO_APARICION_SUBSIDENCIAS_MURO_YES ||
      eventPresionPorosB63Value == INESTABILIDAD_POR_EROSION_INTERNA_PRODUCTO_APARICION_SUBSIDENCIAS_MURO_YES ||
      eventPresionPorosC11Value == INESTABILIDAD_POR_EROSION_INTERNA_PRODUCTO_APARICION_SUBSIDENCIAS_MURO_YES ||
      eventPresionPorosC12Value == INESTABILIDAD_POR_EROSION_INTERNA_PRODUCTO_APARICION_SUBSIDENCIAS_MURO_YES ||
      eventPresionPorosC13Value == INESTABILIDAD_POR_EROSION_INTERNA_PRODUCTO_APARICION_SUBSIDENCIAS_MURO_YES ||
      eventPresionPorosC14Value == INESTABILIDAD_POR_EROSION_INTERNA_PRODUCTO_APARICION_SUBSIDENCIAS_MURO_YES ||
      eventPresionPorosC15Value == INESTABILIDAD_POR_EROSION_INTERNA_PRODUCTO_APARICION_SUBSIDENCIAS_MURO_YES ||
      eventPresionPorosC21Value == INESTABILIDAD_POR_EROSION_INTERNA_PRODUCTO_APARICION_SUBSIDENCIAS_MURO_YES ||
      eventPresionPorosC22Value == INESTABILIDAD_POR_EROSION_INTERNA_PRODUCTO_APARICION_SUBSIDENCIAS_MURO_YES ||
      eventPresionPorosD1Value == INESTABILIDAD_POR_EROSION_INTERNA_PRODUCTO_APARICION_SUBSIDENCIAS_MURO_YES ||
      eventPresionPorosD2Value == INESTABILIDAD_POR_EROSION_INTERNA_PRODUCTO_APARICION_SUBSIDENCIAS_MURO_YES ||
      // Condicion: Presencia de grietas en el muro del depósito: (Evento C1 o C2)
      eventTurbiedadB3Value == INESTABILIDAD_POR_EROSION_INTERNA_PRODUCTO_APARICION_SUBSIDENCIAS_MURO_YES ||
      // Condicion: Presencia de grietas en el muro del depósito: (Evento C1 o C2)
      eventGrietasC1Value == INESTABILIDAD_POR_EROSION_INTERNA_PRODUCTO_APARICION_SUBSIDENCIAS_MURO_YES ||
      eventGrietasC2Value == INESTABILIDAD_POR_EROSION_INTERNA_PRODUCTO_APARICION_SUBSIDENCIAS_MURO_YES,
      {meta: {
        // Condicion: Presencia de subsidencia o socavón en el muro o cubeta del depósito: (Evento C1 o C2)
        eventsIntegridadExternaSubsidenciaC1, eventsIntegridadExternaSubsidenciaC2,
        // Condicion: Distancia mínima al muro de la laguna aguas claras: (Evento B1 o superior)
        eventsDistanciaLagunaB2, eventsDistanciaLagunaC1,
        // Condicion: Presión de poros: (Evento B5 o superior)
        eventsPresionPorosB51, eventsPresionPorosB52, eventsPresionPorosB53,
        eventsPresionPorosB54, eventsPresionPorosB61, eventsPresionPorosB62,
        eventsPresionPorosB63, eventsPresionPorosC11, eventsPresionPorosC12,
        eventsPresionPorosC13, eventsPresionPorosC14, eventsPresionPorosC15,
        eventsPresionPorosC21, eventsPresionPorosC22, eventsPresionPorosD1,
        eventsPresionPorosD2,
        // Condicion: Turbiedad en el sistema de drenaje: (B3)
        eventsTurbiedadB3,
        // Condicion: Presencia de grietas en el muro del depósito: (Evento C1 o C2)
        eventsGrietasC1, eventsGrietasC2}});
}
else {
  series.yield(false,
    {meta: {
      // Condicion: Presencia de subsidencia o socavón en el muro o cubeta del depósito: (Evento C1 o C2)
      eventsIntegridadExternaSubsidenciaC1, eventsIntegridadExternaSubsidenciaC2,
      // Condicion: Distancia mínima al muro de la laguna aguas claras: (Evento B1 o superior)
      eventsDistanciaLagunaB2, eventsDistanciaLagunaC1,
      // Condicion: Presión de poros: (Evento B5 o superior)
      eventsPresionPorosB51, eventsPresionPorosB52, eventsPresionPorosB53,
      eventsPresionPorosB54, eventsPresionPorosB61, eventsPresionPorosB62,
      eventsPresionPorosB63, eventsPresionPorosC11, eventsPresionPorosC12,
      eventsPresionPorosC13, eventsPresionPorosC14, eventsPresionPorosC15,
      eventsPresionPorosC21, eventsPresionPorosC22, eventsPresionPorosD1,
      eventsPresionPorosD2,
      // Condicion: Turbiedad en el sistema de drenaje: (B3)
      eventsTurbiedadB3,
      // Condicion: Presencia de grietas en el muro del depósito: (Evento C1 o C2)
      eventsGrietasC1, eventsGrietasC2}});
}
