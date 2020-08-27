const { cleanArray } = require("common-modules/superation");
const { getValueFromSingleEvent, getValueFromArrayEvents } = require("common-modules/superation");

const INESTABILIDAD_POR_LICUACION_ESTATICA_YES = + true;  // 1

// Condicion: Evento gatillador: Sismo sensible (Evento B)
const eventsTerremoto46 = await series.query({head: "*.terremoto-4-6"});
const eventsTerremoto7 = await series.query({head: "*.terremoto-7"});

// Condicion: Módulo de rigidez y resistencia al corte del muro: (Evento C2)
let eventsModuloResistenciaCorteMuroC2 = await series.queryAll({head:
  "*.modulos-deformacion-resistencia-muro.C2"});

if (!utils.isDefined(eventsModuloResistenciaCorteMuroC2) || eventsModuloResistenciaCorteMuroC2.length == 0) {
  eventsModuloResistenciaCorteMuroC2 = await refs.getMany("*.modulos-deformacion-resistencia-muro.C2");
}

if (!utils.isDefined(eventsModuloResistenciaCorteMuroC2) || eventsModuloResistenciaCorteMuroC2.length == 0) {
  eventsModuloResistenciaCorteMuroC2 = await refs.expand("*.modulos-deformacion-resistencia-muro.C2");
}

if (!utils.isDefined(eventsModuloResistenciaCorteMuroC2) || eventsModuloResistenciaCorteMuroC2.length == 0) {
  eventsModuloResistenciaCorteMuroC2 = await series.query({head: "*.modulos-deformacion-resistencia-muro.C2"});
}

if (!utils.isDefined(eventsModuloResistenciaCorteMuroC2) || eventsModuloResistenciaCorteMuroC2.length == 0) {
  eventsModuloResistenciaCorteMuroC2 = await refs.getOne("*.modulos-deformacion-resistencia-muro.C2");
}

if (!utils.isDefined(eventsModuloResistenciaCorteMuroC2) || eventsModuloResistenciaCorteMuroC2.length == 0) {
  eventsModuloResistenciaCorteMuroC2 = await refs.match("*.modulos-deformacion-resistencia-muro.C2");
}

eventsModuloResistenciaCorteMuroC2 = cleanArray(eventsModuloResistenciaCorteMuroC2);

// Condicion: Presiones de poro: (Evento B5 o superior)
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

if (
  // Condicion: Evento gatillador: Sismo sensible (Evento B)
  utils.isDefined(eventsTerremoto46) &&
  utils.isDefined(eventsTerremoto7) &&
  // Condicion: Módulo de rigidez y resistencia al corte del muro: (Evento C2)
  utils.isDefined(eventsModuloResistenciaCorteMuroC2) && eventsModuloResistenciaCorteMuroC2.length > 0 &&
  // Condicion: Presiones de poro: (Evento B5 o superior)
  utils.isDefined(eventsPresionPorosB51) && eventsPresionPorosB51.length > 0 &&
  utils.isDefined(eventsPresionPorosB52) && eventsPresionPorosB52.length > 0 &&
  utils.isDefined(eventsPresionPorosB54) && eventsPresionPorosB54.length > 0 &&
  utils.isDefined(eventsPresionPorosB53) && eventsPresionPorosB53.length > 0 &&
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
  utils.isDefined(eventsPresionPorosD2) && eventsPresionPorosD2.length > 0) {

    // Condicion: Evento gatillador: Sismo sensible (Evento B)
    const eventTerremoto46Value = getValueFromSingleEvent(eventsTerremoto46,
      "*.terremoto-4-6");
    const eventTerremoto7Value = getValueFromSingleEvent(eventsTerremoto7,
      "*.terremoto-7");

    // Condicion: Módulo de rigidez y resistencia al corte del muro: (Evento C2)
    const eventModulosDeformacionResistenciaMuroC2Value = getValueFromArrayEvents(eventsModuloResistenciaCorteMuroC2,
      "*.modulos-deformacion-resistencia-muro.C2");

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

  series.yield(
    // Condicion: Evento gatillador: Sismo sensible (Evento B)
    (eventTerremoto46Value == INESTABILIDAD_POR_LICUACION_ESTATICA_YES ||
    eventTerremoto7Value == INESTABILIDAD_POR_LICUACION_ESTATICA_YES) &&
    // Condicion: Módulo de rigidez y resistencia al corte del muro: (Evento C2)
    (eventModulosDeformacionResistenciaMuroC2Value == INESTABILIDAD_POR_LICUACION_ESTATICA_YES) &&
    // Condicion: Presiones de poro: (Evento B5 o superior)
    (eventPresionPorosB51Value == INESTABILIDAD_POR_LICUACION_ESTATICA_YES ||
    eventPresionPorosB52Value == INESTABILIDAD_POR_LICUACION_ESTATICA_YES ||
    eventPresionPorosB53Value == INESTABILIDAD_POR_LICUACION_ESTATICA_YES ||
    eventPresionPorosB54Value == INESTABILIDAD_POR_LICUACION_ESTATICA_YES ||
    eventPresionPorosB61Value == INESTABILIDAD_POR_LICUACION_ESTATICA_YES ||
    eventPresionPorosB62Value == INESTABILIDAD_POR_LICUACION_ESTATICA_YES ||
    eventPresionPorosB63Value == INESTABILIDAD_POR_LICUACION_ESTATICA_YES ||
    eventPresionPorosC11Value == INESTABILIDAD_POR_LICUACION_ESTATICA_YES ||
    eventPresionPorosC12Value == INESTABILIDAD_POR_LICUACION_ESTATICA_YES ||
    eventPresionPorosC13Value == INESTABILIDAD_POR_LICUACION_ESTATICA_YES ||
    eventPresionPorosC14Value == INESTABILIDAD_POR_LICUACION_ESTATICA_YES ||
    eventPresionPorosC15Value == INESTABILIDAD_POR_LICUACION_ESTATICA_YES ||
    eventPresionPorosC21Value == INESTABILIDAD_POR_LICUACION_ESTATICA_YES ||
    eventPresionPorosC22Value == INESTABILIDAD_POR_LICUACION_ESTATICA_YES ||
    eventPresionPorosD1Value == INESTABILIDAD_POR_LICUACION_ESTATICA_YES ||
    eventPresionPorosD2Value == INESTABILIDAD_POR_LICUACION_ESTATICA_YES),
    {meta: {
      // Condicion: Evento gatillador: Sismo sensible (Evento B)
      eventsTerremoto46, eventsTerremoto7,
      // Condicion: Módulo de rigidez y resistencia al corte del muro: (Evento C2)
      eventsModuloResistenciaCorteMuroC2,
      // Condicion: Presiones de poro: (Evento B5 o superior)
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
      // Condicion: Evento gatillador: Sismo sensible (Evento B)
      eventsTerremoto46, eventsTerremoto7,
      // Condicion: Módulo de rigidez y resistencia al corte del muro: (Evento C2)
      eventsModuloResistenciaCorteMuroC2,
      // Condicion: Presiones de poro: (Evento B5 o superior)
      eventsPresionPorosB51, eventsPresionPorosB52, eventsPresionPorosB53,
      eventsPresionPorosB54, eventsPresionPorosB61, eventsPresionPorosB62,
      eventsPresionPorosB63, eventsPresionPorosC11, eventsPresionPorosC12,
      eventsPresionPorosC13, eventsPresionPorosC14, eventsPresionPorosC15,
      eventsPresionPorosC21, eventsPresionPorosC22, eventsPresionPorosD1,
      eventsPresionPorosD2}});
}
