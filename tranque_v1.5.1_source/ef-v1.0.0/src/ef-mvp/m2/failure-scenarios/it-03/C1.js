const { cleanArray } = require("common-modules/superation");
const { getValueFromArrayEvents } = require("common-modules/superation");

const INESTABILIDAD_POR_LICUACION_ESTATICA_YES = + true;  // 1

// Condicion: Módulo de rigidez y resistencia al corte del muro: (Evento C2)
let eventsModuloResistenciaCorteMuroC2 = await series.queryAll({head: "*.modulos-deformacion-resistencia-muro.C2"});
eventsModuloResistenciaCorteMuroC2 = cleanArray(eventsModuloResistenciaCorteMuroC2);

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

if (
  // Condicion: Módulo de rigidez y resistencia al corte del muro: (Evento C2)
  utils.isDefined(eventsModuloResistenciaCorteMuroC2) &&
  // Condicion: Presiones de poros: (Evento C1 o superior)
  utils.isDefined(eventsPresionPorosC11) &&
  utils.isDefined(eventsPresionPorosC12) &&
  utils.isDefined(eventsPresionPorosC13) &&
  utils.isDefined(eventsPresionPorosC14) &&
  utils.isDefined(eventsPresionPorosC15) &&
  utils.isDefined(eventsPresionPorosC21) &&
  utils.isDefined(eventsPresionPorosC22) &&
  utils.isDefined(eventsPresionPorosD1) &&
  utils.isDefined(eventsPresionPorosD2)) {

    // Condicion: Módulo de rigidez y resistencia al corte del muro: (Evento C2)
    let eventModuloResistenciaCorteMuroC2Value = getValueFromArrayEvents(eventsModuloResistenciaCorteMuroC2,
      "*.modulos-deformacion-resistencia-muro.C2");

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

  series.yield(
    // Condicion: Módulo de rigidez y resistencia al corte del muro: (Evento C2)
    (eventModuloResistenciaCorteMuroC2Value == INESTABILIDAD_POR_LICUACION_ESTATICA_YES) &&
    // Condicion: Presiones de poros: (Evento C1 o superior)
    (eventPresionPorosC11Value == INESTABILIDAD_POR_LICUACION_ESTATICA_YES ||
    eventPresionPorosC12Value == INESTABILIDAD_POR_LICUACION_ESTATICA_YES ||
    eventPresionPorosC13Value == INESTABILIDAD_POR_LICUACION_ESTATICA_YES ||
    eventPresionPorosC14Value == INESTABILIDAD_POR_LICUACION_ESTATICA_YES ||
    eventPresionPorosC15Value == INESTABILIDAD_POR_LICUACION_ESTATICA_YES ||
    eventPresionPorosC21Value == INESTABILIDAD_POR_LICUACION_ESTATICA_YES ||
    eventPresionPorosC22Value == INESTABILIDAD_POR_LICUACION_ESTATICA_YES ||
    eventPresionPorosD1Value == INESTABILIDAD_POR_LICUACION_ESTATICA_YES ||
    eventPresionPorosD2Value == INESTABILIDAD_POR_LICUACION_ESTATICA_YES),
    {meta: {
      // Condicion: Módulo de rigidez y resistencia al corte del muro: (Evento C2)
      eventsModuloResistenciaCorteMuroC2,
      // Condicion: Presiones de poros: (Evento C1 o superior)
      eventsPresionPorosC11, eventsPresionPorosC12, eventsPresionPorosC13,
      eventsPresionPorosC14, eventsPresionPorosC15, eventsPresionPorosC21,
      eventsPresionPorosC22, eventsPresionPorosD1, eventsPresionPorosD2}});
}
else {
  series.yield(false, {meta: {
    // Condicion: Módulo de rigidez y resistencia al corte del muro: (Evento C2)
    eventsModuloResistenciaCorteMuroC2,
    // Condicion: Presiones de poros: (Evento C1 o superior)
    eventsPresionPorosC11, eventsPresionPorosC12, eventsPresionPorosC13,
    eventsPresionPorosC14, eventsPresionPorosC15, eventsPresionPorosC21,
    eventsPresionPorosC22, eventsPresionPorosD1, eventsPresionPorosD2}});
}
