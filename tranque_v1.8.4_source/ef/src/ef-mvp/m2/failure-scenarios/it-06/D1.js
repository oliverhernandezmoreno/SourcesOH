const { cleanArray } = require("common-modules/superation");
const { getValueFromSingleEvent, getValueFromArrayEvents } = require("common-modules/superation");

const INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES = + true;  // 1

// Condicion: Escenario de falla IT-06: (Evento C1)
let eventsDeslizamientoMenor = await series.queryAll({head: "*.deslizamiento-menor"});
eventsDeslizamientoMenor = cleanArray(eventsDeslizamientoMenor);
let eventsEvidenciaGrietasC3 = await series.queryAll({head: "*.integridad-externa.grietas.C3"});
eventsEvidenciaGrietasC3 = cleanArray(eventsEvidenciaGrietasC3);

// Condicion: Distancia mínima al muro de la laguna aguas claras: (Evento C1)
let eventsDistanciaLagunaC1 = await series.queryAll({head: "*.distancia-laguna.C1"});
eventsDistanciaLagunaC1 = cleanArray(eventsDistanciaLagunaC1);

// Condicion: Presiones de poros: (Evento C1 o superior)
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

let eventsPresionPorosD1 = await series.queryAll({head: "*.D1"});
eventsPresionPorosD1 = cleanArray(eventsPresionPorosD1);

let eventsPresionPorosD2 = await series.queryAll({head: "*.D2"});
eventsPresionPorosD2 = cleanArray(eventsPresionPorosD2);

// Condicion: Presencia de filtraciones en el muro del depósito: (Evento C1 o C2)
let eventsFiltracionesC1 = await series.queryAll({head: "*.integridad-externa.filtraciones.C1"});
let eventsFiltracionesC2 = await series.queryAll({head: "*.integridad-externa.filtraciones.C2"});

if (
  // Condicion: Escenario de falla IT-06: (Evento C1)
  utils.isDefined(eventsDeslizamientoMenor) &&
  utils.isDefined(eventsEvidenciaGrietasC3) &&

  // Condicion: Adicionalmente se cumple al menos uno de los siguientes
  utils.isDefined(eventsDistanciaLagunaC1) &&

  // Condicion: Presiones de poros: (Evento C1 o superior)
  utils.isDefined(eventsPresionPorosC11) &&
  utils.isDefined(eventsPresionPorosC12) &&
  utils.isDefined(eventsPresionPorosC13) &&
  utils.isDefined(eventsPresionPorosC14) &&
  utils.isDefined(eventsPresionPorosC15) &&
  utils.isDefined(eventsPresionPorosC21) &&
  utils.isDefined(eventsPresionPorosC22) &&
  utils.isDefined(eventsPresionPorosD1) &&
  utils.isDefined(eventsPresionPorosD2) &&

  // Condicion: Presencia de filtraciones en el muro del depósito: (Evento C1 o C2)
  utils.isDefined(eventsFiltracionesC1) &&
  utils.isDefined(eventsFiltracionesC2)) {
    // Condicion: Escenario de falla IT-06: (Evento C1)
    let eventDeslizamientoMenorValue = getValueFromArrayEvents(eventsDeslizamientoMenor,
      "*.deslizamiento-menor");
    let eventEvidenciaGrietasC3Value = getValueFromArrayEvents(eventsEvidenciaGrietasC3,
      "*.integridad-externa.grietas.C3");

    // Condicion: Adicionalmente se cumple al menos uno de los siguientes
    let eventDistanciaLagunaC1Value = getValueFromArrayEvents(eventsDistanciaLagunaC1,
      "*.distancia-laguna.C1");

    // Condicion: Presiones de poros: (Evento C1 o superior)
    let eventPresionPorosC11Value = getValueFromArrayEvents(eventsPresionPorosC11, "*.C1-1");
    let eventPresionPorosC12Value = getValueFromArrayEvents(eventsPresionPorosC12, "*.C1-2");
    let eventPresionPorosC13Value = getValueFromArrayEvents(eventsPresionPorosC13, "*.C1-3");
    let eventPresionPorosC14Value = getValueFromArrayEvents(eventsPresionPorosC14, "*.C1-4");
    let eventPresionPorosC15Value = getValueFromArrayEvents(eventsPresionPorosC15, "*.C1-5");
    let eventPresionPorosC21Value = getValueFromArrayEvents(eventsPresionPorosC21, "*.C2-1");
    let eventPresionPorosC22Value = getValueFromArrayEvents(eventsPresionPorosC22, "*.C2-2");
    let eventPresionPorosD1Value = getValueFromArrayEvents(eventsPresionPorosD1, "*.D1");
    let eventPresionPorosD2Value = getValueFromArrayEvents(eventsPresionPorosD2, "*.D2");

    // Condicion: Presencia de filtraciones en el muro del depósito: (Evento C1 o C2)
    let eventIntegridadExternaFiltracionesC1Value = getValueFromSingleEvent(eventsFiltracionesC1,
      "*.integridad-externa.filtraciones.C1");
    let eventIntegridadExternaFiltracionesC2Value = getValueFromSingleEvent(eventsFiltracionesC2,
      "*.integridad-externa.filtraciones.C2");
  series.yield(
      // Condicion: Se deben cumplir todos los eventos en un sector para activar el escenario de falla
      (eventDeslizamientoMenorValue == INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES ||
      eventEvidenciaGrietasC3Value == INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES) &&
      // Condicion: Distancia mínima al muro de la laguna aguas claras: (Evento C1)
      (eventDistanciaLagunaC1Value == INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES ||
      // Condicion: Presiones de poros: (Evento C1 o superior)
      eventPresionPorosC11Value == INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES ||
      eventPresionPorosC12Value == INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES ||
      eventPresionPorosC13Value == INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES ||
      eventPresionPorosC14Value == INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES ||
      eventPresionPorosC15Value == INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES ||
      eventPresionPorosC21Value == INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES ||
      eventPresionPorosC22Value == INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES ||
      eventPresionPorosD1Value == INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES ||
      eventPresionPorosD2Value == INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES ||
      // Condicion: Presencia de filtraciones en el muro del depósito: (Evento C1 o C2)
      eventIntegridadExternaFiltracionesC1Value == INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES ||
      eventIntegridadExternaFiltracionesC2Value == INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES),
      {meta: {
      // Condicion: Escenario de falla IT-06: (Evento C1)
      eventsDeslizamientoMenor, eventsEvidenciaGrietasC3,
      // Condicion: Distancia mínima al muro de la laguna aguas claras: (Evento C1)
      eventsDistanciaLagunaC1,
      // Condicion: Presiones de poros: (Evento C1 o superior)
      eventsPresionPorosC11, eventsPresionPorosC12, eventsPresionPorosC13,
      eventsPresionPorosC14, eventsPresionPorosC15, eventsPresionPorosC21,
      eventsPresionPorosC22, eventsPresionPorosD1, eventsPresionPorosD2,
      // Condicion: Presencia de filtraciones en el muro del depósito: (Evento C1 o C2)
      eventsFiltracionesC1, eventsFiltracionesC2}});
}
else {
  series.yield(false,
      {meta: {
      // Condicion: Escenario de falla IT-06: (Evento C1)
      eventsDeslizamientoMenor, eventsEvidenciaGrietasC3,
      // Condicion: Distancia mínima al muro de la laguna aguas claras: (Evento C1)
      eventsDistanciaLagunaC1,
      // Condicion: Presiones de poros: (Evento C1 o superior)
      eventsPresionPorosC11, eventsPresionPorosC12, eventsPresionPorosC13,
      eventsPresionPorosC14, eventsPresionPorosC15, eventsPresionPorosC21,
      eventsPresionPorosC22, eventsPresionPorosD1, eventsPresionPorosD2,
      // Condicion: Presencia de filtraciones en el muro del depósito: (Evento C1 o C2)
      eventsFiltracionesC1, eventsFiltracionesC2}});
}
