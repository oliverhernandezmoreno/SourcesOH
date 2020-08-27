const { cleanArray } = require("common-modules/superation");
const { getValueFromArrayEvents } = require("common-modules/superation");

const INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES = + true;  // 1

// Condicion: Deslizamiento superficial de un sector del talud del muro
let eventsDeslizamientoMenor = await series.queryAll({head: "*.deslizamiento-menor"});
eventsDeslizamientoMenor = cleanArray(eventsDeslizamientoMenor);

// Condicion: Evidencia de grietas en el muro del depósito: (Evento C3)
let eventsEvidenciaGrietasC3 = await series.queryAll({head: "*.integridad-externa.grietas.C3"});
eventsEvidenciaGrietasC3 = cleanArray(eventsEvidenciaGrietasC3);

if (
  // Condicion: Deslizamiento superficial de un sector del talud del muro
  utils.isDefined(eventsDeslizamientoMenor) &&
  // Condicion: Evidencia de grietas en el muro del depósito: (Evento C3)
  utils.isDefined(eventsEvidenciaGrietasC3)) {

    // Condicion: Módulo de rigidez y resistencia al corte del muro
    let eventDeslizamientoMenorValue = getValueFromArrayEvents(eventsDeslizamientoMenor,
      "*.deslizamiento-menor");

    // Condicion: Deslizamiento superficial de un sector del talud del muro
    let eventEvidenciaGrietasC3Value = getValueFromArrayEvents(eventsEvidenciaGrietasC3,
      "*.integridad-externa.grietas.C3");

  series.yield(
    // Condicion: Módulo de rigidez y resistencia al corte del muro
    (eventDeslizamientoMenorValue == INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES) ||
    // Condicion: Deslizamiento superficial de un sector del talud del muro
    (eventEvidenciaGrietasC3Value == INESTABILIDAD_POR_DESLIZAMIENTO_MURO_YES),
    {meta: {
      // Condicion: Módulo de rigidez y resistencia al corte del muro
      eventsDeslizamientoMenor,
      // Condicion: Deslizamiento superficial de un sector del talud del muro
      eventsEvidenciaGrietasC3}});
}
else {
  series.yield(false, {meta: {
    // Condicion: Módulo de rigidez y resistencia al corte del muro
    eventsDeslizamientoMenor,
    // Condicion: Deslizamiento superficial de un sector del talud del muro
    eventsEvidenciaGrietasC3}});
}
