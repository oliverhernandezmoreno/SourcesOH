/**
 * Get the events upper of superation.
 *
 * @param threshold The threshold to compare.
 * @param events The events.
 * @returns <eventsSuperacion> The array of events upper of threshold.
 */
module.exports.getSuperation = (threshold, events) => {
  let eventsSuperacion = [];
  if (utils.isDefined(events)) {
    for (let i=0; i<events.length; i++) {
      const event = events[i];
      if (event.value > threshold) {
        eventsSuperacion.push(event);
      }
    }
  }
  return eventsSuperacion;
}

/**
 * Get the events upper of superation. Just compares the first element.
 *
 * @param threshold The threshold to compare.
 * @param events The events.
 * @returns <eventsSuperacion> The array of events upper of threshold.
 */
module.exports.getSuperationFirst = (threshold, events) => {
  let eventsSuperacion = [];
  if (utils.isDefined(events)) {
    for (let i=0; i<events.length&&i<1; i++) {
      const event = events[i];
      if (event.value > threshold) {
        eventsSuperacion.push(event);
      }
    }
  }
  return eventsSuperacion;
}

/**
 * Get all events with a criteria.
 *
 * @param criteria The value of the criteria to compare the value.
 * @param events The events.
 * @returns <eventsSuperacion> The array of events with the criteria to compare the value.
 */
module.exports.areAllEventsCriteriaFirst = (criteria, events) => {
  if (utils.isDefined(events)) {
    for (let i=0; i<events.length&&i<1; i++) {
      const value = events[i].value;
      if (value !== criteria) {
        return false;
      }
    }
  }
  return true;
}

module.exports.getCountCumpleCriteria = (criteria, events, alfaValue) => {
  let countCumpleCriteria = 0;
  if (utils.isDefined(events)) {
    for (let i=0; i<events.length && countCumpleCriteria<alfaValue; i++) {
      const value = events[i].value;
      if (value !== criteria) {
        break;
      }
      else {
        countCumpleCriteria++;
      }
    }
  }
  return countCumpleCriteria;
}

module.exports.getSuperationAlfa = (threshold, events, alfaValue) => {
  let eventsSuperacion = [];
  if (utils.isDefined(events)) {
    for (let i=0; i<events.length&&i<alfaValue; i++) {
      const event = events[i];
      if (event.value > threshold) {
        eventsSuperacion.push(event);
      }
    }
  }
  return eventsSuperacion;
}

module.exports.getPlanDepositacionProyecto = (planDepositacionProyecto, dateToSearch) => {
  const timeToSearch = (new Date(dateToSearch)).getTime();
  if (utils.isDefined(planDepositacionProyecto)) {
    const planDepositacionProyectoLength = planDepositacionProyecto.value.curve.length;
    for (let i=0; i<planDepositacionProyectoLength; i++) {
      const dateDepositacion = planDepositacionProyecto.value.curve[i].date;
      const timeDepositacion = (new Date(dateDepositacion)).getTime();
      if (timeToSearch <= timeDepositacion) {
        return planDepositacionProyecto.value.curve[i-1].value;
      }
    }
    return planDepositacionProyecto.value.curve[planDepositacionProyectoLength-1].value;
  }
  return undefined;
}

module.exports.hayOtroInstrumentoMismoSectorDistintaUbicacionSuperacion = (events) => {
  if (utils.isDefined(events)) {
    if (events.length > 0) {
      const firstEvent = events[0];
      const sector = firstEvent.sector;
      const x = firstEvent.x;
      const y = firstEvent.y;
      if (events.length > 1) {
        for (let i=1; i<events.length; i++) {
          const event = events[i];
          if (sector.localeCompare(event.sector) == 0 &&
              (x != event.x || y != event.y)) {
            return true;
          }
        }
      }
    }
  }
  return false;
}

module.exports.hayOtroInstrumentoMismoSectorDistintaUbicacionSuperacionThreshold = (threshold, events) => {
  if (utils.isDefined(events)) {
    if (events.length > 0) {
      const firstEvent = events[0];
      const sector = firstEvent.sector;
      const x = firstEvent.x;
      const y = firstEvent.y;
      if (events.length > 1) {
        for (let i=1; i<events.length; i++) {
          const event = events[i];
          if (sector.localeCompare(event.sector) == 0 &&
              (x != event.x || y != event.y) &&
              event.value > threshold) {
            return true;
          }
        }
      }
    }
  }
  return false;
}

module.exports.sonValidablesEntreSi = (events1, events2) => {
  let count = 0;
  if (utils.isDefined(events1) && utils.isDefined(events2)) {
    for (let i=0; i<events1.length; i++) {
      const validable = events1[i].validable;
      for (let j=0; j<events2.length; j++) {
        const name = events2[j].name;
        if (name.localeCompare(validable) == 0) {
          count++;
        }
      }
    }
  }
  return count >= 1;
}

module.exports.getValidadoSuperation = (threshold, events, validadosYes) => {
  let eventsValidadoSuperacion = [];
  if (utils.isDefined(events)) {
    for (let i=0; i<events.length; i++) {
      const event = events[i];
      if (event.value > threshold && module.exports.esValidado(event.name, validadosYes)) {
        eventsValidadoSuperacion.push(event);
      }
    }
  }
  return eventsValidadoSuperacion;
}

module.exports.esValidado = (name, validadosYes) => {
  if (utils.isDefined(validadosYes)) {
    for (let j=0; j<validadosYes.length; j+=1) {
      let instrumentoName = validadosYes[j].name;
      instrumentoName = instrumentoName.replace(".validado", "");
      if (name.localeCompare(instrumentoName) == 0) {
        return true;
      }
    }
  }
  return false;
}

module.exports.hayDosInstrumentoMismoSectorDistintaUbicacionSuperacion = (events) => {
  let count = 0;
  if (utils.isDefined(events)) {
    if (events.length > 0) {
      const firstEvent = events[0];
      let sector = firstEvent.sector;
      let x = firstEvent.x;
      let y = firstEvent.y;
      if (events.length > 1) {
        for (let i=1; i<events.length; i++) {
          const event = events[i];
          if (sector.localeCompare(event.sector) == 0 &&
              (x != event.x || y != event.y)) {
            count++;
          }
        }
      }
    }
  }
  return count >= 2;
}

module.exports.hayOtroInstrumentoMismoSectorDistintaUbicacionSuperacion2ValidadorSuperacion1Threshold = (threshold2, events) => {
  if (utils.isDefined(events)) {
    if (events.length > 0) {
      const firstEvent = events[0];
      let sector = firstEvent.sector;
      let x = firstEvent.x;
      let y = firstEvent.y;
      if (events.length > 1) {
        for (let i=1; i<events.length; i++) {
          const event = events[i];
          if (sector.localeCompare(event.sector) == 0 &&
              (x != event.x || y != event.y) &&
              event.value > threshold2 &&
              module.exports.validadorSuperation1(events, event.validable)) {
            return true;
          }
        }
      }
    }
  }
  return false;
}

module.exports.hayOtroInstrumentoMismoSectorDistintaUbicacionSuperacion2ValidadorSuperacion1 = (events1, events2) => {
  if (utils.isDefined(events2)) {
    if (events2.length > 0) {
      const firstEvent = events2[0];
      let sector = firstEvent.sector;
      let x = firstEvent.x;
      let y = firstEvent.y;
      if (events2.length > 1) {
        for (let i=1; i<events2.length; i++) {
          const event = events2[i];
          if (sector.localeCompare(event.sector) == 0 &&
              (x != event.x || y != event.y) &&
              module.exports.validadorSuperation1(events1, event.validable)) {
            return true;
          }
        }
      }
    }
  }
  return false;
}

module.exports.validadorSuperation1 = (events, validable) => {
  if (utils.isDefined(events)) {
    for (let i=0; i<events.length; i++) {
      const event = events[i];
      if (validable.localeCompare(event.name) == 0) {
        return true;
      }
    }
  }
  return false;
}

module.exports.cleanArray = (events) => {
  let cleanedEvents = [];
  if (utils.isDefined(events)) {
    for (let i=0; i<events.length; i++) {
      const event = events[i];
      if (utils.isDefined(event)) {
        cleanedEvents.push(event);
      }
    }
  }
  return cleanedEvents;
}

module.exports.getValueFromSingleEvent = (event, canonical_name) => {
  let eventValue = undefined;
  if (utils.isDefined(event[canonical_name])) {
    const eventLength = event[canonical_name].length;
    if (eventLength > 0) {
      if (utils.isDefined(event[canonical_name][0].value)) {
        eventValue = event[canonical_name][0].value;
      }
    }
  }
  else {
    eventValue = event.value;
  }
  return eventValue;
}

module.exports.getValueFromArrayEvents = (events, canonical_name) => {
  let eventValue = undefined;
  if (utils.isDefined(events[canonical_name])) {
    const eventsLength = events[canonical_name].length;
    if (eventsLength > 0) {
      if (utils.isDefined(events[canonical_name][0].value)) {
        eventValue = events[canonical_name][0].value;
      }
    }
  }
  else {
    const eventsLength = events.length;
    if (eventsLength > 0) {
      if (utils.isDefined(events[0].value)) {
        eventValue = events[0].value
      }
    }
  }
  return eventValue;
}
