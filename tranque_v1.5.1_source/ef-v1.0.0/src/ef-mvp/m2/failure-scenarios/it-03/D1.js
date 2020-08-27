const { cleanArray } = require("common-modules/superation");
const { getValueFromArrayEvents } = require("common-modules/superation");

const INESTABILIDAD_POR_LICUACION_ESTATICA_YES = + true;  // 1

// Condicion: Módulo de rigidez y resistencia al corte del muro: (Evento D1)
let eventsModuloResistenciaCorteMuroD1 = await series.queryAll({head: "*.modulos-deformacion-resistencia-muro.D1"});
eventsModuloResistenciaCorteMuroD1 = cleanArray(eventsModuloResistenciaCorteMuroD1);

if (
  // Condicion: Módulo de rigidez y resistencia al corte del muro: (Evento D1)
  utils.isDefined(eventsModuloResistenciaCorteMuroD1)) {
    // Condicion: Módulo de rigidez y resistencia al corte del muro: (Evento D1)
    let eventModuloResistenciaCorteMuroD1Value = getValueFromArrayEvents(eventsModuloResistenciaCorteMuroD1,
      "*.modulos-deformacion-resistencia-muro.D1");

  series.yield(
      // Condicion: Módulo de rigidez y resistencia al corte del muro: (Evento D1)
      (eventModuloResistenciaCorteMuroD1Value == INESTABILIDAD_POR_LICUACION_ESTATICA_YES),
      {meta: {
      // Condicion: Módulo de rigidez y resistencia al corte del muro: (Evento D1)
      eventsModuloResistenciaCorteMuroD1}});
}
else {
  series.yield(false, {meta: {
      // Condicion: Módulo de rigidez y resistencia al corte del muro: (Evento D1)
      eventsModuloResistenciaCorteMuroD1}});
}
