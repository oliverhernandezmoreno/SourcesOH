const { cleanArray } = require("common-modules/superation");
const { getValueFromArrayEvents } = require("common-modules/superation");

const INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES = + true;  // 1

// Condicion: Escenario de falla IT-06: (Evento C1)
let eventsDeslizamientoMenor = await series.queryAll({head: "*.deslizamiento-menor"});
eventsDeslizamientoMenor = cleanArray(eventsDeslizamientoMenor);
let eventsEvidenciaGrietasC3 = await series.queryAll({head: "*.integridad-externa.grietas.C3"});
eventsEvidenciaGrietasC3 = cleanArray(eventsEvidenciaGrietasC3);

// Condicion: Evento D2: (Por confirmación manual)
let eventsConfirmacionManual = await series.queryAll({head: "*.confirmacion-manual-D2"});
eventsConfirmacionManual = cleanArray(eventsConfirmacionManual);

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

let eventsPresionPorosB1 = await series.queryAll({head: "*.B1"});
eventsPresionPorosB1 = cleanArray(eventsPresionPorosB1);

let eventsPresionPorosB2 = await series.queryAll({head: "*.B2"});
eventsPresionPorosB2 = cleanArray(eventsPresionPorosB2);

if (
  // Condicion: Escenario de falla IT-06: (Evento C1)
  utils.isDefined(eventsDeslizamientoMenor) &&
  utils.isDefined(eventsEvidenciaGrietasC3) &&

  // Condicion: Evento D2: (Por confirmación manual)
  utils.isDefined(eventsConfirmacionManual) &&

  // Condicion: Presiones de poros: (Protocolo B5 o superior)
  utils.isDefined(eventsPresionPorosB51) &&
  utils.isDefined(eventsPresionPorosB52) &&
  utils.isDefined(eventsPresionPorosB53) &&
  utils.isDefined(eventsPresionPorosB54) &&
  utils.isDefined(eventsPresionPorosB61) &&
  utils.isDefined(eventsPresionPorosB62) &&
  utils.isDefined(eventsPresionPorosB63) &&

  // Condicion: Presiones de poros: (Protocolo B1 o B2)
  utils.isDefined(eventsPresionPorosB1) &&
  utils.isDefined(eventsPresionPorosB2)) {
    // Condicion: Escenario de falla IT-06: (Evento C1)
    let eventDeslizamientoMenorValue = getValueFromArrayEvents(eventsDeslizamientoMenor,
      "*.deslizamiento-menor");
    let eventEvidenciaGrietasC3Value = getValueFromArrayEvents(eventsEvidenciaGrietasC3,
      "*.integridad-externa.grietas.C3");

    // Condicion: Evento D2: (Por confirmación manual)
    let eventConfirmacionManualValue = getValueFromArrayEvents(eventsConfirmacionManual,
      "*.confirmacion-manual-D2");

    // Condicion: Presiones de poros: (Protocolo B5 o superior)
    let eventPresionPorosB51Value = getValueFromArrayEvents(eventsPresionPorosB51, "*.B5-1");
    let eventPresionPorosB52Value = getValueFromArrayEvents(eventsPresionPorosB52, "*.B5-2");
    let eventPresionPorosB53Value = getValueFromArrayEvents(eventsPresionPorosB53, "*.B5-3");
    let eventPresionPorosB54Value = getValueFromArrayEvents(eventsPresionPorosB54, "*.B5-4");
    let eventPresionPorosB61Value = getValueFromArrayEvents(eventsPresionPorosB61, "*.B6-1");
    let eventPresionPorosB62Value = getValueFromArrayEvents(eventsPresionPorosB62, "*.B6-2");
    let eventPresionPorosB63Value = getValueFromArrayEvents(eventsPresionPorosB63, "*.B6-3");

    // Condicion: Presiones de poros: (Protocolo B1 o B2)
    let eventPresionPorosB1Value = getValueFromArrayEvents(eventsPresionPorosB1, "*.B1");
    let eventPresionPorosB2Value = getValueFromArrayEvents(eventsPresionPorosB2, "*.B2");
  series.yield(
      // Condicion: Se deben cumplir todos los eventos en un sector para activar el escenario de falla
      (eventDeslizamientoMenorValue == INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES ||
      eventEvidenciaGrietasC3Value == INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES) &&
      // Condicion: Evento D2: (Por confirmación manual)
      (eventConfirmacionManualValue == INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES) &&
      // Condicion: Presiones de poros: (Evento C1 o superior)
      (eventPresionPorosB51Value == INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES ||
      eventPresionPorosB52Value == INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES ||
      eventPresionPorosB53Value == INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES ||
      eventPresionPorosB54Value == INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES ||
      eventPresionPorosB61Value == INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES ||
      eventPresionPorosB62Value == INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES ||
      eventPresionPorosB63Value == INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES ||
      // Condicion: Presiones de poros: (Protocolo B1 o B2)
      eventPresionPorosB1Value == INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES ||
      eventPresionPorosB2Value == INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES),
      {meta: {
      // Condicion: Escenario de falla IT-06: (Evento C1)
      eventsDeslizamientoMenor, eventsEvidenciaGrietasC3,
      // Condicion: Evento D2: (Por confirmación manual)
      eventsConfirmacionManual,
      // Condicion: Presiones de poros: (Protocolo B5 o superior)
      eventsPresionPorosB51, eventsPresionPorosB52, eventsPresionPorosB53,
      eventsPresionPorosB54, eventsPresionPorosB61, eventsPresionPorosB62,
      eventsPresionPorosB63,
      // Condicion: Presiones de poros: (Protocolo B1 o B2)
      eventsPresionPorosB1, eventsPresionPorosB2}});
}
else {
  series.yield(false,
    {meta: {
      // Condicion: Escenario de falla IT-06: (Evento C1)
      eventsDeslizamientoMenor, eventsEvidenciaGrietasC3,
      // Condicion: Evento D2: (Por confirmación manual)
      eventsConfirmacionManual,
      // Condicion: Presiones de poros: (Protocolo B5 o superior)
      eventsPresionPorosB51, eventsPresionPorosB52, eventsPresionPorosB53,
      eventsPresionPorosB54, eventsPresionPorosB61, eventsPresionPorosB62,
      eventsPresionPorosB63,
      // Condicion: Presiones de poros: (Protocolo B1 o B2)
      eventsPresionPorosB1, eventsPresionPorosB2}});
}
