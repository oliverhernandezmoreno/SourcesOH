const { cleanArray } = require("common-modules/superation");
const { getValueFromArrayEvents } = require("common-modules/superation");

const INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES = + true;  // 1

// Condicion: Integridad de los estribos: (Evento B2)
let eventsIntegridadExternaEstribosC1 = await series.queryAll({head: "*.integridad-externa.estribos.C1"});
eventsIntegridadExternaEstribosC1 = cleanArray(eventsIntegridadExternaEstribosC1);

let eventsIntegridadExternaEstribosD1 = await series.queryAll({head: "*.integridad-externa.estribos.D1"});
eventsIntegridadExternaEstribosD1 = cleanArray(eventsIntegridadExternaEstribosD1);

// Condicion: Presencia de filtraciones en el muro del depósito: (Evento C1 o C2)
let eventsIntegridadExternaFiltracionesC1 = await series.queryAll({head: "*.integridad-externa.filtraciones.C1"});
eventsIntegridadExternaFiltracionesC1 = cleanArray(eventsIntegridadExternaFiltracionesC1);

let eventsIntegridadExternaFiltracionesC2 = await series.queryAll({head: "*.integridad-externa.filtraciones.C2"});
eventsIntegridadExternaFiltracionesC2 = cleanArray(eventsIntegridadExternaFiltracionesC2);

// Condicion: Distancia mínima al muro de la laguna aguas claras: (Evento C1)
let eventsDistanciaLagunaC1 = await series.queryAll({head: "*.distancia-laguna.C1"});
eventsDistanciaLagunaC1 = cleanArray(eventsDistanciaLagunaC1);

// Condicion: Presiones de poros: (Evento B5 o superior)
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
eventsPresionPorosC13 = cleanArray(eventsPresionPorosC13);

let eventsPresionPorosC14 = await series.queryAll({head: "*.C1-4"});
eventsPresionPorosC14 = cleanArray(eventsPresionPorosC14);

let eventsPresionPorosC15 = await series.queryAll({head: "*.C1-5"});
eventsPresionPorosC15 = cleanArray(eventsPresionPorosC15);

let eventsPresionPorosC21 = await series.queryAll({head: "*.C2-1"});
eventsPresionPorosC21 = cleanArray(eventsPresionPorosC21);

let eventsPresionPorosC22 = await series.queryAll({head: "*.C2-2"});
eventsPresionPorosC22 = cleanArray(eventsPresionPorosC22);

let eventsPresionPorosD1 = await series.queryAll({head: "*.presion-poros.D1"});
eventsPresionPorosD1 = cleanArray(eventsPresionPorosD1);

let eventsPresionPorosD2 = await series.queryAll({head: "*.D2"});
eventsPresionPorosD2 = cleanArray(eventsPresionPorosD2);

if (
  // Condicion: Integridad de los estribos: (Evento B2)
  utils.isDefined(eventsIntegridadExternaEstribosC1) &&
  utils.isDefined(eventsIntegridadExternaEstribosD1) &&
  // Condicion: Presencia de filtraciones en el muro del depósito: (Evento C1 o C2)
  utils.isDefined(eventsIntegridadExternaFiltracionesC1) &&
  utils.isDefined(eventsIntegridadExternaFiltracionesC2) &&
  // Condicion: Distancia mínima al muro de la laguna aguas claras: (Evento C1)
  utils.isDefined(eventsDistanciaLagunaC1) &&
  // Condicion: Presiones de poros: (Evento B5 o superior)
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
  utils.isDefined(eventsPresionPorosD2)) {

    // Condicion: Integridad de los estribos: (Evento B2)
    let eventIntegridadExternaEstribosC1Value =
      getValueFromArrayEvents(eventsIntegridadExternaEstribosC1, "*.integridad-externa.estribos.C1");
    let eventIntegridadExternaEstribosD1Value =
      getValueFromArrayEvents(eventsIntegridadExternaEstribosD1, "*.integridad-externa.estribos.D1");
    // Condicion: Presencia de filtraciones en el muro del depósito: (Evento C1 o C2)
    let eventIntegridadExternaFiltracionesC1Value =
      getValueFromArrayEvents(eventsIntegridadExternaFiltracionesC1, "*.integridad-externa.filtraciones.C1");
    let eventIntegridadExternaFiltracionesC2Value =
      getValueFromArrayEvents(eventsIntegridadExternaFiltracionesC2, "*.integridad-externa.filtraciones.C2");
    // Condicion: Distancia mínima al muro de la laguna aguas claras: (Evento C1)
    let eventDistanciaLagunaC1Value =
      getValueFromArrayEvents(eventsDistanciaLagunaC1, "*.distancia-laguna.C1");

    // Condicion: Presiones de poros: (Evento B5 o superior)
    let eventPresionPorosB51Value = getValueFromArrayEvents(eventsPresionPorosB51, "*.B5-1");
    let eventPresionPorosB52Value = getValueFromArrayEvents(eventsPresionPorosB52, "*.B5-2");
    let eventPresionPorosB53Value = getValueFromArrayEvents(eventsPresionPorosB53, "*.B5-3");
    let eventPresionPorosB54Value = getValueFromArrayEvents(eventsPresionPorosB54, "*.B5-4");
    let eventPresionPorosB61Value = getValueFromArrayEvents(eventsPresionPorosB61, "*.B6-1");
    let eventPresionPorosB62Value = getValueFromArrayEvents(eventsPresionPorosB62, "*.B6-2");
    let eventPresionPorosB63Value = getValueFromArrayEvents(eventsPresionPorosB63, "*.B6-3");
    let eventPresionPorosC11Value = getValueFromArrayEvents(eventsPresionPorosC11, "*.C1-1");
    let eventPresionPorosC12Value = getValueFromArrayEvents(eventsPresionPorosC12, "*.C1-2");
    let eventPresionPorosC13Value = getValueFromArrayEvents(eventsPresionPorosC13, "*.C1-3");
    let eventPresionPorosC14Value = getValueFromArrayEvents(eventsPresionPorosC14, "*.C1-4");
    let eventPresionPorosC15Value = getValueFromArrayEvents(eventsPresionPorosC15, "*.C1-5");
    let eventPresionPorosC21Value = getValueFromArrayEvents(eventsPresionPorosC21, "*.C2-1");
    let eventPresionPorosC22Value = getValueFromArrayEvents(eventsPresionPorosC22, "*.C2-2");
    let eventPresionPorosD1Value = getValueFromArrayEvents(eventsPresionPorosD1, "*.D1");
    let eventPresionPorosD2Value = getValueFromArrayEvents(eventsPresionPorosD2, "*.D2");

  series.yield(
    // Condicion: Integridad de los estribos: (Evento B2)
    (eventIntegridadExternaEstribosC1Value == INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES ||
    eventIntegridadExternaEstribosD1Value == INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES ||
    // Condicion: Presencia de filtraciones en el muro del depósito: (Evento C1 o C2)
    eventIntegridadExternaFiltracionesC1Value == INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES ||
    eventIntegridadExternaFiltracionesC2Value == INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES ||
    // Condicion: Distancia mínima al muro de la laguna aguas claras: (Evento C1)
    eventDistanciaLagunaC1Value == INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES) &&
    // Condicion: Presiones de poros: (Evento B5 o superior)
    (eventPresionPorosB51Value == INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES ||
    eventPresionPorosB52Value == INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES ||
    eventPresionPorosB53Value == INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES ||
    eventPresionPorosB54Value == INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES ||
    eventPresionPorosB61Value == INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES ||
    eventPresionPorosB62Value == INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES ||
    eventPresionPorosB63Value == INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES ||
    eventPresionPorosC11Value == INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES ||
    eventPresionPorosC12Value == INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES ||
    eventPresionPorosC13Value == INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES ||
    eventPresionPorosC14Value == INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES ||
    eventPresionPorosC15Value == INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES ||
    eventPresionPorosC21Value == INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES ||
    eventPresionPorosC22Value == INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES ||
    eventPresionPorosD1Value == INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES ||
    eventPresionPorosD2Value == INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES),
    {meta: {
      // Condicion: Integridad de los estribos: (Evento B2)
      eventsIntegridadExternaEstribosC1, eventsIntegridadExternaEstribosD1,
      // Condicion: Presencia de filtraciones en el muro del depósito: (Evento C1 o C2)
      eventsIntegridadExternaFiltracionesC1, eventsIntegridadExternaFiltracionesC2,
      // Condicion: Distancia mínima al muro de la laguna aguas claras: (Evento C1)
      eventsDistanciaLagunaC1,
      // Condicion2.SectoC Presiones de poros: (Evento B5 o superior)
      eventsPresionPorosB51, eventsPresionPorosB52, eventsPresionPorosB53,
      eventsPresionPorosB54, eventsPresionPorosB61, eventsPresionPorosB62,
      eventsPresionPorosB63, eventsPresionPorosC11, eventsPresionPorosC12,
      eventsPresionPorosC13, eventsPresionPorosC14, eventsPresionPorosC15,
      eventsPresionPorosC21, eventsPresionPorosC22, eventsPresionPorosD1,
      eventsPresionPorosD2}});
}
else {
  series.yield(false,
    {meta: {
      // Condicion: Integridad de los estribos: (Evento B2)
      eventsIntegridadExternaEstribosC1, eventsIntegridadExternaEstribosD1,
      // Condicion: Presencia de filtraciones en el muro del depósito: (Evento C1 o C2)
      eventsIntegridadExternaFiltracionesC1, eventsIntegridadExternaFiltracionesC2,
      // Condicion: Distancia mínima al muro de la laguna aguas claras: (Evento C1)
      eventsDistanciaLagunaC1,
      // Condicion2.SectoC Presiones de poros: (Evento B5 o superior)
      eventsPresionPorosB51, eventsPresionPorosB52, eventsPresionPorosB53,
      eventsPresionPorosB54, eventsPresionPorosB61, eventsPresionPorosB62,
      eventsPresionPorosB63, eventsPresionPorosC11, eventsPresionPorosC12,
      eventsPresionPorosC13, eventsPresionPorosC14, eventsPresionPorosC15,
      eventsPresionPorosC21, eventsPresionPorosC22, eventsPresionPorosD1,
      eventsPresionPorosD2}});
}
