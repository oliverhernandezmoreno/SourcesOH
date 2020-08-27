const { cleanArray } = require("common-modules/superation");
const { getValueFromSingleEvent, getValueFromArrayEvents } = require("common-modules/superation");

const EROSION_INTERNA_PRODUCTO_FILTRACION_DESCONTROLADAS_YES = + true;  // 1

// Condicion: Presencia de filtraciones en el muro del depósito: (Evento C1 o C2)
let eventsFiltracionesC1 = await series.queryAll({head:
  "*.integridad-externa.filtraciones.C1"});
eventsFiltracionesC1 = cleanArray(eventsFiltracionesC1);

let eventsFiltracionesC2 = await series.queryAll({head:
  "*.integridad-externa.filtraciones.C2"});
eventsFiltracionesC2 = cleanArray(eventsFiltracionesC2);

// Condicion: Distancia mínima al muro de la laguna aguas claras: (Evento B1 o superior)
let eventsDistanciaLagunaB2 = await series.queryAll({head:
  "*.distancia-laguna.B2"});
eventsDistanciaLagunaB2 = cleanArray(eventsDistanciaLagunaB2);

let eventsDistanciaLagunaC1 = await series.queryAll({head:
  "*.distancia-laguna.C1"});
eventsDistanciaLagunaC1 = cleanArray(eventsDistanciaLagunaC1);

// Condicion: Presiones de poros: (Evento C1 o superior)
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

// Condicion: Turbiedad en el sistema de drenaje: (Evento B1, B2 o B3)
let eventsTurbiedadB3 = await series.queryAll({head: "*.turbiedad.B3"});
eventsTurbiedadB3 = cleanArray(eventsTurbiedadB3);

// Condicion: Presencia de grietas en el muro del depósito: (Evento C1 o C2)
const eventsGrietasC1 = await series.queryAll({head:
  "*.integridad-externa.grietas.C1"});

const eventsGrietasC2 = await series.queryAll({head:
  "*.integridad-externa.grietas.C2"});

if (
  // Condicion: Presencia de filtraciones en el muro del depósito: (Evento C1 o C2)
  utils.isDefined(eventsFiltracionesC1) && eventsFiltracionesC1.length > 0 &&
  utils.isDefined(eventsFiltracionesC2) && eventsFiltracionesC2.length > 0 &&

  // Condicion: Adicionalmente se cumple al menos uno de los siguientes
  utils.isDefined(eventsDistanciaLagunaB2) && eventsDistanciaLagunaB2.length > 0 &&
  utils.isDefined(eventsDistanciaLagunaC1) && eventsDistanciaLagunaC1.length > 0 &&

  // Condicion: Presiones de poros: (Evento C1 o superior)
  utils.isDefined(eventsPresionPorosB51) && eventsPresionPorosB51.length > 0 &&
  utils.isDefined(eventsPresionPorosB53) && eventsPresionPorosB53.length > 0 &&
  utils.isDefined(eventsPresionPorosB52) && eventsPresionPorosB52.length > 0 &&
  utils.isDefined(eventsPresionPorosB54) && eventsPresionPorosB54.length > 0 &&
  utils.isDefined(eventsPresionPorosB61) && eventsPresionPorosB61.length > 0 &&
  utils.isDefined(eventsPresionPorosB62) && eventsPresionPorosB62.length > 0 &&
  utils.isDefined(eventsPresionPorosB63) && eventsPresionPorosB63.length > 0 &&
  utils.isDefined(eventsPresionPorosC11) && eventsPresionPorosC11.length > 0 &&
  utils.isDefined(eventsPresionPorosC12) && eventsPresionPorosC12.length > 0 &&
  utils.isDefined(eventsPresionPorosC13) && eventsPresionPorosC13.length > 0 &&
  utils.isDefined(eventsPresionPorosC14) && eventsPresionPorosC14.length > 0 &&
  utils.isDefined(eventsPresionPorosC15) && eventsPresionPorosC15.length > 0 &&
  utils.isDefined(eventsPresionPorosC21) && eventsPresionPorosC21.length > 0 &&
  utils.isDefined(eventsPresionPorosC22) && eventsPresionPorosC22.length > 0 &&
  utils.isDefined(eventsPresionPorosD1) && eventsPresionPorosD1.length > 0 &&
  utils.isDefined(eventsPresionPorosD2) && eventsPresionPorosD2.length > 0 &&

  // Condicion: Turbiedad en el sistema de drenaje: (B3)
  utils.isDefined(eventsTurbiedadB3) &&

  // Condicion: Presencia de filtraciones en el muro del depósito: (Evento C1 o C2)
  utils.isDefined(eventsGrietasC1) && eventsGrietasC1.length > 0 &&
  utils.isDefined(eventsGrietasC2) && eventsGrietasC2.length > 0) {
    // Condicion: Presencia de filtraciones en el muro del depósito: (Evento C1 o C2)
    const eventFiltracionesC1Value = getValueFromArrayEvents(eventsFiltracionesC1,
      "*.integridad-externa.filtraciones.C1");
    const eventFiltracionesC2Value = getValueFromArrayEvents(eventsFiltracionesC2,
      "*.integridad-externa.filtraciones.C2");

    // Condicion: Distancia mínima al muro de la laguna aguas claras: (Evento B1 o superior)
    const eventDistanciaLagunaB2Value = getValueFromArrayEvents(eventsDistanciaLagunaB2,
      "*.distancia-laguna.B2");
    const eventDistanciaLagunaC1Value = getValueFromArrayEvents(eventsDistanciaLagunaC1,
      "*.distancia-laguna.C1");

    // Condicion: Presiones de poros: (Evento C1 o superior)
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

    // Condicion: Turbiedad en el sistema de drenaje: (B3)
    const eventTurbiedadB3Value = getValueFromArrayEvents(eventsTurbiedadB3,
      "*.turbiedad.B3");

    // Condicion: Presencia de grietas en el muro del depósito: (Evento C1 o C2)
    const eventGrietasC1Value = getValueFromSingleEvent(eventsGrietasC1,
      "*.integridad-externa.grietas.C1");
    const eventGrietasC2Value = getValueFromSingleEvent(eventsGrietasC2,
      "*.integridad-externa.grietas.C2");
  series.yield(
      // Condicion: Presencia de filtraciones en el muro del depósito: (Evento C1 o C2)
      (eventFiltracionesC1Value == EROSION_INTERNA_PRODUCTO_FILTRACION_DESCONTROLADAS_YES &&
      eventFiltracionesC2Value == EROSION_INTERNA_PRODUCTO_FILTRACION_DESCONTROLADAS_YES) ||
      // Condicion: Distancia mínima al muro de la laguna aguas claras: (Evento B1 o superior)
      (eventDistanciaLagunaB2Value == EROSION_INTERNA_PRODUCTO_FILTRACION_DESCONTROLADAS_YES ||
      eventDistanciaLagunaC1Value == EROSION_INTERNA_PRODUCTO_FILTRACION_DESCONTROLADAS_YES) ||
      // Condicion: Presiones de poros: (Evento C1 o superior)
      (eventPresionPorosB51Value == EROSION_INTERNA_PRODUCTO_FILTRACION_DESCONTROLADAS_YES ||
      eventPresionPorosB52Value == EROSION_INTERNA_PRODUCTO_FILTRACION_DESCONTROLADAS_YES ||
      eventPresionPorosB53Value == EROSION_INTERNA_PRODUCTO_FILTRACION_DESCONTROLADAS_YES ||
      eventPresionPorosB54Value == EROSION_INTERNA_PRODUCTO_FILTRACION_DESCONTROLADAS_YES ||
      eventPresionPorosB61Value == EROSION_INTERNA_PRODUCTO_FILTRACION_DESCONTROLADAS_YES ||
      eventPresionPorosB62Value == EROSION_INTERNA_PRODUCTO_FILTRACION_DESCONTROLADAS_YES ||
      eventPresionPorosB63Value == EROSION_INTERNA_PRODUCTO_FILTRACION_DESCONTROLADAS_YES ||
      eventPresionPorosC11Value == EROSION_INTERNA_PRODUCTO_FILTRACION_DESCONTROLADAS_YES ||
      eventPresionPorosC12Value == EROSION_INTERNA_PRODUCTO_FILTRACION_DESCONTROLADAS_YES ||
      eventPresionPorosC13Value == EROSION_INTERNA_PRODUCTO_FILTRACION_DESCONTROLADAS_YES ||
      eventPresionPorosC14Value == EROSION_INTERNA_PRODUCTO_FILTRACION_DESCONTROLADAS_YES ||
      eventPresionPorosC15Value == EROSION_INTERNA_PRODUCTO_FILTRACION_DESCONTROLADAS_YES ||
      eventPresionPorosC21Value == EROSION_INTERNA_PRODUCTO_FILTRACION_DESCONTROLADAS_YES ||
      eventPresionPorosC22Value == EROSION_INTERNA_PRODUCTO_FILTRACION_DESCONTROLADAS_YES ||
      eventPresionPorosD1Value == EROSION_INTERNA_PRODUCTO_FILTRACION_DESCONTROLADAS_YES ||
      eventPresionPorosD2Value == EROSION_INTERNA_PRODUCTO_FILTRACION_DESCONTROLADAS_YES) ||
      // Condicion: Turbiedad en el sistema de drenaje: (B3)
      (eventTurbiedadB3Value == EROSION_INTERNA_PRODUCTO_FILTRACION_DESCONTROLADAS_YES) ||
      // Condicion: Presencia de grietas en el muro del depósito: (Evento C1 o C2)
      (eventGrietasC1Value == EROSION_INTERNA_PRODUCTO_FILTRACION_DESCONTROLADAS_YES ||
      eventGrietasC2Value == EROSION_INTERNA_PRODUCTO_FILTRACION_DESCONTROLADAS_YES),
      {meta: {
      // Condicion: Módulo de rigidez y resistencia al corte del muro: (Evento D1)
      eventsFiltracionesC1, eventsFiltracionesC2,
      // Condicion: Presiones de poros: (Evento C1 o superior)
      eventsPresionPorosB51, eventsPresionPorosB52, eventsPresionPorosB53, eventsPresionPorosB54,
      eventsPresionPorosB61, eventsPresionPorosB62, eventsPresionPorosB63,
      eventsPresionPorosC11, eventsPresionPorosC12, eventsPresionPorosC13,
      eventsPresionPorosC14, eventsPresionPorosC15, eventsPresionPorosC21,
      eventsPresionPorosC22, eventsPresionPorosD1, eventsPresionPorosD2,
      // Condicion: Turbiedad en el sistema de drenaje: (B3)
      eventsTurbiedadB3,
      // Condicion: Presencia de grietas en el muro del depósito: (Evento C1 o C2)
      eventsGrietasC1, eventsGrietasC2}});
}
else {
  series.yield(false,
      {meta: {
      // Condicion: Módulo de rigidez y resistencia al corte del muro: (Evento D1)
      eventsFiltracionesC1, eventsFiltracionesC2,
      // Condicion: Presiones de poros: (Evento C1 o superior)
      eventsPresionPorosB51, eventsPresionPorosB52, eventsPresionPorosB53, eventsPresionPorosB54,
      eventsPresionPorosB61, eventsPresionPorosB62, eventsPresionPorosB63,
      eventsPresionPorosC11, eventsPresionPorosC12, eventsPresionPorosC13,
      eventsPresionPorosC14, eventsPresionPorosC15, eventsPresionPorosC21,
      eventsPresionPorosC22, eventsPresionPorosD1, eventsPresionPorosD2,
      // Condicion: Turbiedad en el sistema de drenaje: (B3)
      eventsTurbiedadB3,
      // Condicion: Presencia de grietas en el muro del depósito: (Evento C1 o C2)
      eventsGrietasC1, eventsGrietasC2}});
}
