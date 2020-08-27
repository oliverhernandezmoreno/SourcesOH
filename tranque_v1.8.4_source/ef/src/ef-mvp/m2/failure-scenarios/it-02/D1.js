const { cleanArray } = require("common-modules/superation");
const { getValueFromSingleEvent, getValueFromArrayEvents } = require("common-modules/superation");

const INESTABILIDAD_POR_AUMENTO_PRESION_POROS_EVIDENCIA_DEFORMACION_YES = + true;  // 1

// Condicion1.General
const eventsTerremoto46 = await series.query({head: "*.terremoto-4-6"});

const eventsTerremoto7 = await series.query({head: "*.terremoto-7"});

//Condicion: Presiones de poros: (Evento B5 o superior)
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

let eventsPresionPorosD1 = await series.queryAll({head: "*.D1"});
eventsPresionPorosD1 = cleanArray(eventsPresionPorosD1);

let eventsPresionPorosD2 = await series.queryAll({head: "*.D2"});
eventsPresionPorosD2 = cleanArray(eventsPresionPorosD2);

// Condicion: Desplazamiento o deformación del muro: (Evento C1, C2, C3, C4 o C5)
let eventsMuroMonolitoEjeXC1 = await series.queryAll({head: "*.muro.monolito.eje-x.C1"});
eventsMuroMonolitoEjeXC1 = cleanArray(eventsMuroMonolitoEjeXC1);

let eventsMuroMonolitoEjeYC2 = await series.queryAll({head: "*.muro.monolito.eje-y.C2"});
eventsMuroMonolitoEjeYC2 = cleanArray(eventsMuroMonolitoEjeYC2);

let eventsMuroMonolitoEjeZC3 = await series.queryAll({head: "*.muro.monolito.eje-z.C3"});
eventsMuroMonolitoEjeZC3 = cleanArray(eventsMuroMonolitoEjeZC3);

let eventsMuroInclinometroEjeXC4 = await series.queryAll({head: "*.muro.inclinometro.eje-x.C4"});
eventsMuroInclinometroEjeXC4 = cleanArray(eventsMuroInclinometroEjeXC4);

let eventsMuroInclinometroEjeYC5 = await series.queryAll({head: "*.muro.inclinometro.eje-y.C5"});
eventsMuroInclinometroEjeYC5 = cleanArray(eventsMuroInclinometroEjeYC5);

let eventsMuroInclinometroEjeZC6 = await series.queryAll({head: "*.muro.inclinometro.eje-z.C6"});
eventsMuroInclinometroEjeZC6 = cleanArray(eventsMuroInclinometroEjeZC6);

// Condicion: Deformación del coronamiento: (Evento C1, C2 o C3)
let eventsCoronamientoMonolitoEjeXC1 = await series.queryAll({head: "*.coronamiento.monolito.eje-x.C1"});
eventsCoronamientoMonolitoEjeXC1 = cleanArray(eventsCoronamientoMonolitoEjeXC1);

let eventsCoronamientoMonolitoEjeYC2 = await series.queryAll({head: "*.coronamiento.monolito.eje-y.C2"});
eventsCoronamientoMonolitoEjeYC2 = cleanArray(eventsCoronamientoMonolitoEjeYC2);

let eventsCoronamientoMonolitoEjeZC3 = await series.queryAll({head: "*.coronamiento.monolito.eje-z.C3"});
eventsCoronamientoMonolitoEjeZC3 = cleanArray(eventsCoronamientoMonolitoEjeZC3);

if (
  // Condicion1.General
  utils.isDefined(eventsTerremoto46) &&
  utils.isDefined(eventsTerremoto7) &&
  // Condicion: Presiones de poros: (Evento B5 o superior)
  utils.isDefined(eventsPresionPorosB51) &&
  utils.isDefined(eventsPresionPorosB52) &&
  utils.isDefined(eventsPresionPorosB53) &&
  utils.isDefined(eventsPresionPorosB54) &&
  utils.isDefined(eventsPresionPorosB61) &&
  utils.isDefined(eventsPresionPorosB62) &&
  utils.isDefined(eventsPresionPorosC11) &&
  utils.isDefined(eventsPresionPorosB63) &&
  utils.isDefined(eventsPresionPorosC12) &&
  utils.isDefined(eventsPresionPorosC13) &&
  utils.isDefined(eventsPresionPorosC14) &&
  utils.isDefined(eventsPresionPorosC15) &&
  utils.isDefined(eventsPresionPorosC21) &&
  utils.isDefined(eventsPresionPorosC22) &&
  utils.isDefined(eventsPresionPorosD1) &&
  utils.isDefined(eventsPresionPorosD2) &&
  // Condicion: Desplazamiento o deformación del muro: (Evento C1, C2, C3, C4 o C5)
  utils.isDefined(eventsMuroMonolitoEjeXC1) &&
  utils.isDefined(eventsMuroMonolitoEjeYC2) &&
  utils.isDefined(eventsMuroMonolitoEjeZC3) &&
  utils.isDefined(eventsMuroInclinometroEjeXC4) &&
  utils.isDefined(eventsMuroInclinometroEjeYC5) &&
  utils.isDefined(eventsMuroInclinometroEjeZC6) &&
  // Condicion: Deformación del coronamiento: (Evento C1, C2 o C3)
  utils.isDefined(eventsCoronamientoMonolitoEjeXC1) &&
  utils.isDefined(eventsCoronamientoMonolitoEjeYC2) &&
  utils.isDefined(eventsCoronamientoMonolitoEjeZC3)) {

    // Condicion1.General
    const eventTerremoto46Value = getValueFromSingleEvent(eventsTerremoto46,
      "*.terremoto-4-6");
    const eventTerremoto7Value = getValueFromSingleEvent(eventsTerremoto7,
      "*.terremoto-7");

    // Condicion: Presiones de poros: (Evento B5 o superior)
    const eventPresionPorosB51Value = getValueFromArrayEvents(eventsPresionPorosB51,
      "*.B5-1");
    const eventPresionPorosB52Value = getValueFromArrayEvents(eventsPresionPorosB52,
      "*.B5-2");
    const eventPresionPorosB53Value = getValueFromArrayEvents(eventsPresionPorosB53,
      "*.B5-3");
    const eventPresionPorosB54Value = getValueFromArrayEvents(eventsPresionPorosB54,
      "*.B5-4");
    const eventPresionPorosB61Value = getValueFromArrayEvents(eventsPresionPorosB61,
      "*.B6-1");
    const eventPresionPorosB62Value = getValueFromArrayEvents(eventsPresionPorosB62,
      "*.B6-2");
    const eventPresionPorosB63Value = getValueFromArrayEvents(eventsPresionPorosB63,
      "*.B6-3");
    const eventPresionPorosC11Value = getValueFromArrayEvents(eventsPresionPorosC11,
      "*.C1-1");
    const eventPresionPorosC12Value = getValueFromArrayEvents(eventsPresionPorosC12,
      "*.C1-2");
    const eventPresionPorosC13Value = getValueFromArrayEvents(eventsPresionPorosC13,
      "*.C1-3");
    const eventPresionPorosC14Value = getValueFromArrayEvents(eventsPresionPorosC14,
      "*.C1-4");
    const eventPresionPorosC15Value = getValueFromArrayEvents(eventsPresionPorosC15,
      "*.C1-5");
    const eventPresionPorosC21Value = getValueFromArrayEvents(eventsPresionPorosC21,
      "*.C2-1");
    const eventPresionPorosC22Value = getValueFromArrayEvents(eventsPresionPorosC22,
      "*.C2-2");
    const eventPresionPorosD1Value = getValueFromArrayEvents(eventsPresionPorosD1,
      "*.D1");
    const eventPresionPorosD2Value = getValueFromArrayEvents(eventsPresionPorosD2,
      "*.D2");

    // Condicion: Desplazamiento o deformación del muro: (Evento C1, C2, C3, C4 o C5)
    const eventMuroMonolitoEjeXC1Value = getValueFromArrayEvents(eventsMuroMonolitoEjeXC1,
      "*.muro.monolito.eje-x.C1");
    const eventMuroMonolitoEjeYC2Value = getValueFromArrayEvents(eventsMuroMonolitoEjeYC2,
      "*.muro.monolito.eje-y.C2");
    const eventMuroMonolitoEjeZC3Value = getValueFromArrayEvents(eventsMuroMonolitoEjeZC3,
      "*.muro.monolito.eje-z.C3");
    const eventMuroInclinometroEjeXC4Value = getValueFromArrayEvents(eventsMuroInclinometroEjeXC4,
      "*.muro.inclinometro.eje-x.C4");
    const eventMuroInclinometroEjeYC5Value = getValueFromArrayEvents(eventsMuroInclinometroEjeYC5,
      "*.muro.inclinometro.eje-y.C5");
    const eventMuroInclinometroEjeZC6Value = getValueFromArrayEvents(eventsMuroInclinometroEjeZC6,
      "*.muro.inclinometro.eje-z.C6");

    // Condicion: Deformación del coronamiento: (Evento C1, C2 o C3)
    const eventCoronamientoMonolitoEjeXC1Value = getValueFromArrayEvents(eventsCoronamientoMonolitoEjeXC1,
      "*.coronamiento.monolito.eje-x.C1");
    const eventCoronamientoMonolitoEjeYC2Value = getValueFromArrayEvents(eventsCoronamientoMonolitoEjeYC2,
      "*.coronamiento.monolito.eje-y.C2");
    const eventCoronamientoMonolitoEjeZC3Value = getValueFromArrayEvents(eventsCoronamientoMonolitoEjeZC3,
      "*.coronamiento.monolito.eje-z.C3");

  series.yield(
    // Condicion1.General
    (eventTerremoto46Value == INESTABILIDAD_POR_AUMENTO_PRESION_POROS_EVIDENCIA_DEFORMACION_YES ||
    eventTerremoto7Value == INESTABILIDAD_POR_AUMENTO_PRESION_POROS_EVIDENCIA_DEFORMACION_YES) &&
    // Condicion2.SectoC Presiones de poros: (Evento B5 o superior)
    (eventPresionPorosB51Value == INESTABILIDAD_POR_AUMENTO_PRESION_POROS_EVIDENCIA_DEFORMACION_YES ||
    eventPresionPorosB52Value == INESTABILIDAD_POR_AUMENTO_PRESION_POROS_EVIDENCIA_DEFORMACION_YES ||
    eventPresionPorosB53Value == INESTABILIDAD_POR_AUMENTO_PRESION_POROS_EVIDENCIA_DEFORMACION_YES ||
    eventPresionPorosB54Value == INESTABILIDAD_POR_AUMENTO_PRESION_POROS_EVIDENCIA_DEFORMACION_YES ||
    eventPresionPorosB61Value == INESTABILIDAD_POR_AUMENTO_PRESION_POROS_EVIDENCIA_DEFORMACION_YES ||
    eventPresionPorosB62Value == INESTABILIDAD_POR_AUMENTO_PRESION_POROS_EVIDENCIA_DEFORMACION_YES ||
    eventPresionPorosB63Value == INESTABILIDAD_POR_AUMENTO_PRESION_POROS_EVIDENCIA_DEFORMACION_YES ||
    eventPresionPorosC11Value == INESTABILIDAD_POR_AUMENTO_PRESION_POROS_EVIDENCIA_DEFORMACION_YES ||
    eventPresionPorosC12Value == INESTABILIDAD_POR_AUMENTO_PRESION_POROS_EVIDENCIA_DEFORMACION_YES ||
    eventPresionPorosC13Value == INESTABILIDAD_POR_AUMENTO_PRESION_POROS_EVIDENCIA_DEFORMACION_YES ||
    eventPresionPorosC14Value == INESTABILIDAD_POR_AUMENTO_PRESION_POROS_EVIDENCIA_DEFORMACION_YES ||
    eventPresionPorosC15Value == INESTABILIDAD_POR_AUMENTO_PRESION_POROS_EVIDENCIA_DEFORMACION_YES ||
    eventPresionPorosC21Value == INESTABILIDAD_POR_AUMENTO_PRESION_POROS_EVIDENCIA_DEFORMACION_YES ||
    eventPresionPorosC22Value == INESTABILIDAD_POR_AUMENTO_PRESION_POROS_EVIDENCIA_DEFORMACION_YES ||
    eventPresionPorosD1Value == INESTABILIDAD_POR_AUMENTO_PRESION_POROS_EVIDENCIA_DEFORMACION_YES ||
    eventPresionPorosD2Value == INESTABILIDAD_POR_AUMENTO_PRESION_POROS_EVIDENCIA_DEFORMACION_YES) &&
    // Condicion: Desplazamiento o deformación del muro: (Evento C1, C2, C3, C4 o C5)
    (eventMuroMonolitoEjeXC1Value == INESTABILIDAD_POR_AUMENTO_PRESION_POROS_EVIDENCIA_DEFORMACION_YES ||
    eventMuroMonolitoEjeYC2Value == INESTABILIDAD_POR_AUMENTO_PRESION_POROS_EVIDENCIA_DEFORMACION_YES ||
    eventMuroMonolitoEjeZC3Value == INESTABILIDAD_POR_AUMENTO_PRESION_POROS_EVIDENCIA_DEFORMACION_YES ||
    eventMuroInclinometroEjeXC4Value == INESTABILIDAD_POR_AUMENTO_PRESION_POROS_EVIDENCIA_DEFORMACION_YES ||
    eventMuroInclinometroEjeYC5Value == INESTABILIDAD_POR_AUMENTO_PRESION_POROS_EVIDENCIA_DEFORMACION_YES ||
    eventMuroInclinometroEjeZC6Value == INESTABILIDAD_POR_AUMENTO_PRESION_POROS_EVIDENCIA_DEFORMACION_YES ||
    // Condicion: Deformación del coronamiento: (Evento C1, C2 o C3)
    eventCoronamientoMonolitoEjeXC1Value == INESTABILIDAD_POR_AUMENTO_PRESION_POROS_EVIDENCIA_DEFORMACION_YES ||
    eventCoronamientoMonolitoEjeYC2Value == INESTABILIDAD_POR_AUMENTO_PRESION_POROS_EVIDENCIA_DEFORMACION_YES ||
    eventCoronamientoMonolitoEjeZC3Value == INESTABILIDAD_POR_AUMENTO_PRESION_POROS_EVIDENCIA_DEFORMACION_YES),
    {meta: {
      // Condicion1.General
      eventsTerremoto46, eventsTerremoto7,
      // Condicion2.SectoC Presiones de poros: (Evento B5 o superior)
      eventsPresionPorosB51, eventsPresionPorosB52, eventsPresionPorosB53,
      eventsPresionPorosB54, eventsPresionPorosB61, eventsPresionPorosB62,
      eventsPresionPorosB63, eventsPresionPorosC11, eventsPresionPorosC12,
      eventsPresionPorosC13, eventsPresionPorosC14, eventsPresionPorosC15,
      eventsPresionPorosC21, eventsPresionPorosC22, eventsPresionPorosD1,
      eventsPresionPorosD2,
      // Condicion: Desplazamiento o deformación del muro: (Evento C1, C2, C3, C4 o C5)
      eventsMuroMonolitoEjeXC1, eventsMuroMonolitoEjeYC2, eventsMuroMonolitoEjeZC3,
      eventsMuroInclinometroEjeXC4, eventsMuroInclinometroEjeYC5, eventsMuroInclinometroEjeZC6,
      // Condicion: Deformación del coronamiento: (Evento C1, C2 o C3)
      eventsCoronamientoMonolitoEjeXC1, eventsCoronamientoMonolitoEjeYC2, eventsCoronamientoMonolitoEjeZC3}});
}
else {
  series.yield(false,
    {meta: {
      // Condicion1.General
      eventsTerremoto46, eventsTerremoto7,
      // Condicion2.SectoC Presiones de poros: (Evento B5 o superior)
      eventsPresionPorosB51, eventsPresionPorosB52, eventsPresionPorosB53,
      eventsPresionPorosB54, eventsPresionPorosB61, eventsPresionPorosB62,
      eventsPresionPorosB63, eventsPresionPorosC11, eventsPresionPorosC12,
      eventsPresionPorosC13, eventsPresionPorosC14, eventsPresionPorosC15,
      eventsPresionPorosC21, eventsPresionPorosC22, eventsPresionPorosD1,
      eventsPresionPorosD2,
      // Condicion: Desplazamiento o deformación del muro: (Evento C1, C2, C3, C4 o C5)
      eventsMuroMonolitoEjeXC1, eventsMuroMonolitoEjeYC2, eventsMuroMonolitoEjeZC3,
      eventsMuroInclinometroEjeXC4, eventsMuroInclinometroEjeYC5, eventsMuroInclinometroEjeZC6,
      // Condicion: Deformación del coronamiento: (Evento C1, C2 o C3)
      eventsCoronamientoMonolitoEjeXC1, eventsCoronamientoMonolitoEjeYC2, eventsCoronamientoMonolitoEjeZC3}});
}
