const { cleanArray } = require("common-modules/superation");

const INESTABILIDAD_POR_SISMO_EFECTOS_ADVERSOS_YES = + true;  // 1

// Condicion1.General
const eventsTerremoto46 = await series.query({head: "*.terremoto-4-6"});

const eventsTerremoto7 = await series.query({head: "*.terremoto-7"});

// Condicion2.SectoC
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
eventsPresionPorosD1 = cleanArray(eventsPresionPorosC11);

let eventsPresionPorosD2 = await series.queryAll({head: "*.D2"});
eventsPresionPorosD2 = cleanArray(eventsPresionPorosD2);

// Condicion3.SectoC
let eventsGrietasC2 = await series.queryAll({head: "*.integridad-externa.grietas.C2"});

let eventsFiltracionesC2 = await series.queryAll({head: "*.integridad-externa.filtraciones.C2"});

let eventsPresionPorosB3 = await series.queryAll({head: "*.B3"});
eventsPresionPorosB3 = cleanArray(eventsPresionPorosB3);

if (
  // Condicion1.General
  utils.isDefined(eventsTerremoto46) &&
  utils.isDefined(eventsTerremoto7) &&
  // Condicion2.SectoC
  utils.isDefined(eventsPresionPorosB51) && eventsPresionPorosB51.length > 0 &&
  utils.isDefined(eventsPresionPorosB52) && eventsPresionPorosB52.length > 0 &&
  utils.isDefined(eventsPresionPorosB53) && eventsPresionPorosB53.length > 0 &&
  utils.isDefined(eventsPresionPorosB54) && eventsPresionPorosB54.length > 0 &&
  utils.isDefined(eventsPresionPorosB61) && eventsPresionPorosB61.length > 0 &&
  utils.isDefined(eventsPresionPorosB62) && eventsPresionPorosB62.length > 0 &&
  utils.isDefined(eventsPresionPorosB63) && eventsPresionPorosB63.length > 0 &&
  utils.isDefined(eventsPresionPorosC11) && eventsPresionPorosC11.length > 0 &&
  utils.isDefined(eventsPresionPorosC12) && eventsPresionPorosC12.length > 0 &&
  utils.isDefined(eventsPresionPorosC14) && eventsPresionPorosC14.length > 0 &&
  utils.isDefined(eventsPresionPorosC13) && eventsPresionPorosC13.length > 0 &&
  utils.isDefined(eventsPresionPorosC15) && eventsPresionPorosC15.length > 0 &&
  utils.isDefined(eventsPresionPorosC21) && eventsPresionPorosC21.length > 0 &&
  utils.isDefined(eventsPresionPorosC22) && eventsPresionPorosC22.length > 0 &&
  utils.isDefined(eventsPresionPorosD1) && eventsPresionPorosD1.length > 0 &&
  utils.isDefined(eventsPresionPorosD2) && eventsPresionPorosD2.length > 0 &&
  // Condicion3.SectoC
  utils.isDefined(eventsGrietasC2) && eventsGrietasC2.length > 0 &&
  utils.isDefined(eventsFiltracionesC2) && eventsFiltracionesC2.length > 0 &&
  utils.isDefined(eventsPresionPorosB3) && eventsPresionPorosB3.length > 0) {
    let eventTerremoto46Value = undefined;
    if (utils.isDefined(eventsTerremoto46["*.terremoto-4-6"])) {
      eventTerremoto46Value = eventsTerremoto46["*.terremoto-4-6"][0].value;
    }
    else {
      eventTerremoto46Value = eventsTerremoto46.value;
    }
    let eventTerremoto7Value = undefined;
    if (utils.isDefined(eventsTerremoto7["*.terremoto-7"])) {
      eventTerremoto7Value = eventsTerremoto7["*.terremoto-7"][0].value;
    }
    else {
      eventTerremoto7Value = eventsTerremoto7.value;
    }
    let eventPresionPorosB51Value = undefined;
    if (utils.isDefined(eventsPresionPorosB51["*.B5-1"])) {
      eventPresionPorosB51Value = eventsPresionPorosB51["*.B5-1"][0].value;
    }
    else {
      eventPresionPorosB51Value = eventsPresionPorosB51[0].value;
    }
    let eventPresionPorosB52Value = undefined;
    if (utils.isDefined(eventsPresionPorosB52["*.B5-2"])) {
      eventPresionPorosB52Value = eventsPresionPorosB52["*.B5-2"][0].value;
    }
    else {
      eventPresionPorosB52Value = eventsPresionPorosB52[0].value;
    }
    let eventPresionPorosB53Value = undefined;
    if (utils.isDefined(eventsPresionPorosB53["*.B5-3"])) {
      eventPresionPorosB53Value = eventsPresionPorosB53["*.B5-3"][0].value;
    }
    else {
      eventPresionPorosB53Value = eventsPresionPorosB53[0].value;
    }
    let eventPresionPorosB54Value = undefined;
    if (utils.isDefined(eventsPresionPorosB54["*.B5-4"])) {
      eventPresionPorosB54Value = eventsPresionPorosB54["*.B5-4"][0].value;
    }
    else {
      eventPresionPorosB54Value = eventsPresionPorosB54[0].value;
    }
    let eventPresionPorosB61Value = undefined;
    if (utils.isDefined(eventsPresionPorosB61["*.B6-1"])) {
      eventPresionPorosB61Value = eventsPresionPorosB61["*.B6-1"][0].value;
    }
    else {
      eventPresionPorosB61Value = eventsPresionPorosB61[0].value;
    }
    let eventPresionPorosB62Value = undefined;
    if (utils.isDefined(eventsPresionPorosB62["*.B6-2"])) {
      eventPresionPorosB62Value = eventsPresionPorosB62["*.B6-2"][0].value;
    }
    else {
      eventPresionPorosB62Value = eventsPresionPorosB62[0].value;
    }
    let eventPresionPorosB63Value = undefined;
    if (utils.isDefined(eventsPresionPorosB63["*.B6-3"])) {
      eventPresionPorosB63Value = eventsPresionPorosB63["*.B6-3"][0].value;
    }
    else {
      eventPresionPorosB63Value = eventsPresionPorosB63[0].value;
    }
    let eventPresionPorosC11Value = undefined;
    if (utils.isDefined(eventsPresionPorosC11["*.C1-1"])) {
      eventPresionPorosC11Value = eventsPresionPorosC11["*.C1-1"][0].value;
    }
    else {
      eventPresionPorosC11Value = eventsPresionPorosC11[0].value;
    }
    let eventPresionPorosC12Value = undefined;
    if (utils.isDefined(eventsPresionPorosC12["*.C1-2"])) {
      eventPresionPorosC12Value = eventsPresionPorosC12["*.C1-2"][0].value;
    }
    else {
      eventPresionPorosC12Value = eventsPresionPorosC12[0].value;
    }
    let eventPresionPorosC13Value = undefined;
    if (utils.isDefined(eventsPresionPorosC13["*.C1-3"])) {
      eventPresionPorosC13Value = eventsPresionPorosC13["*.C1-3"][0].value;
    }
    else {
      eventPresionPorosC13Value = eventsPresionPorosC13[0].value;
    }
    let eventPresionPorosC14Value = undefined;
    if (utils.isDefined(eventsPresionPorosC14["*.C1-4"])) {
      eventPresionPorosC14Value = eventsPresionPorosC14["*.C1-4"][0].value;
    }
    else {
      eventPresionPorosC14Value = eventsPresionPorosC14[0].value;
    }
    let eventPresionPorosC15Value = undefined;
    if (utils.isDefined(eventsPresionPorosC15["*.C1-5"])) {
      eventPresionPorosC15Value = eventsPresionPorosC15["*.C1-5"][0].value;
    }
    else {
      eventPresionPorosC15Value = eventsPresionPorosC15[0].value;
    }
    let eventPresionPorosC21Value = undefined;
    if (utils.isDefined(eventsPresionPorosC21["*.C2-1"])) {
      eventPresionPorosC21Value = eventsPresionPorosC21["*.C2-1"][0].value;
    }
    else {
      eventPresionPorosC21Value = eventsPresionPorosC21[0].value;
    }
    let eventPresionPorosC22Value = undefined;
    if (utils.isDefined(eventsPresionPorosC22["*.C2-2"])) {
      eventPresionPorosC22Value = eventsPresionPorosC22["*.C2-2"][0].value;
    }
    else {
      eventPresionPorosC22Value = eventsPresionPorosC22[0].value;
    }
    let eventPresionPorosD1Value = undefined;
    if (utils.isDefined(eventsPresionPorosD1["*.D1"])) {
      eventPresionPorosD1Value = eventsPresionPorosD1["*.D1"][0].value;
    }
    else {
      eventPresionPorosD1Value = eventsPresionPorosD1[0].value;
    }
    let eventPresionPorosD2Value = undefined;
    if (utils.isDefined(eventsPresionPorosD2["*.D2"])) {
      eventPresionPorosD2Value = eventsPresionPorosD2["*.D2"][0].value;
    }
    else {
      eventPresionPorosD2Value = eventsPresionPorosD2[0].value;
    }
    let eventGrietasC2Value = undefined;
    if (utils.isDefined(eventsGrietasC2[0])) {
      eventGrietasC2Value = eventsGrietasC2[0].value;
    }
    let eventFiltracionesC2Value = undefined;
    if (utils.isDefined(eventsFiltracionesC2[0])) {
      eventFiltracionesC2Value = eventsFiltracionesC2[0].value;
    }
    let eventPresionPorosB3Value = undefined;
    if (utils.isDefined(eventsPresionPorosB3["*.B3"])) {
      eventPresionPorosB3Value = eventsPresionPorosB3["*.B3"][0].value;
    }
    else {
      eventPresionPorosB3Value = eventsPresionPorosB3[0].value;
    }
  series.yield(
    (eventTerremoto46Value == INESTABILIDAD_POR_SISMO_EFECTOS_ADVERSOS_YES ||
    eventTerremoto7Value == INESTABILIDAD_POR_SISMO_EFECTOS_ADVERSOS_YES) &&
    (eventPresionPorosB51Value == INESTABILIDAD_POR_SISMO_EFECTOS_ADVERSOS_YES &&
    eventPresionPorosB52Value == INESTABILIDAD_POR_SISMO_EFECTOS_ADVERSOS_YES ||
    eventPresionPorosB53Value == INESTABILIDAD_POR_SISMO_EFECTOS_ADVERSOS_YES ||
    eventPresionPorosB54Value == INESTABILIDAD_POR_SISMO_EFECTOS_ADVERSOS_YES ||
    eventPresionPorosB61Value == INESTABILIDAD_POR_SISMO_EFECTOS_ADVERSOS_YES ||
    eventPresionPorosB62Value == INESTABILIDAD_POR_SISMO_EFECTOS_ADVERSOS_YES ||
    eventPresionPorosB63Value == INESTABILIDAD_POR_SISMO_EFECTOS_ADVERSOS_YES ||
    eventPresionPorosC11Value == INESTABILIDAD_POR_SISMO_EFECTOS_ADVERSOS_YES ||
    eventPresionPorosC12Value == INESTABILIDAD_POR_SISMO_EFECTOS_ADVERSOS_YES ||
    eventPresionPorosC13Value == INESTABILIDAD_POR_SISMO_EFECTOS_ADVERSOS_YES ||
    eventPresionPorosC14Value == INESTABILIDAD_POR_SISMO_EFECTOS_ADVERSOS_YES ||
    eventPresionPorosC15Value == INESTABILIDAD_POR_SISMO_EFECTOS_ADVERSOS_YES ||
    eventPresionPorosC21Value == INESTABILIDAD_POR_SISMO_EFECTOS_ADVERSOS_YES ||
    eventPresionPorosC22Value == INESTABILIDAD_POR_SISMO_EFECTOS_ADVERSOS_YES ||
    eventPresionPorosD1Value == INESTABILIDAD_POR_SISMO_EFECTOS_ADVERSOS_YES ||
    eventPresionPorosD2Value == INESTABILIDAD_POR_SISMO_EFECTOS_ADVERSOS_YES) &&
    (eventGrietasC2Value == INESTABILIDAD_POR_SISMO_EFECTOS_ADVERSOS_YES ||
    eventFiltracionesC2Value == INESTABILIDAD_POR_SISMO_EFECTOS_ADVERSOS_YES ||
    eventPresionPorosB3Value == INESTABILIDAD_POR_SISMO_EFECTOS_ADVERSOS_YES),
    {meta: {eventsTerremoto46, eventsPresionPorosB51, eventsPresionPorosB52,
      eventsPresionPorosB53, eventsPresionPorosB54, eventsPresionPorosB61,
      eventsPresionPorosB62, eventsPresionPorosB63, eventsPresionPorosC11,
      eventsPresionPorosC12, eventsPresionPorosC13, eventsPresionPorosC14,
      eventsPresionPorosC15, eventsPresionPorosC21, eventsPresionPorosC22,
      eventsPresionPorosD1, eventsPresionPorosD2, eventsGrietasC2,
      eventsFiltracionesC2, eventsPresionPorosB3}});
}
else {
  series.yield(false, {meta: {eventsTerremoto46, eventsPresionPorosB51, eventsPresionPorosB52,
    eventsPresionPorosB53, eventsPresionPorosB54, eventsPresionPorosB61,
    eventsPresionPorosB62, eventsPresionPorosB63, eventsPresionPorosC11,
    eventsPresionPorosC12, eventsPresionPorosC13, eventsPresionPorosC14,
    eventsPresionPorosC15, eventsPresionPorosC21, eventsPresionPorosC22,
    eventsPresionPorosD1, eventsPresionPorosD2, eventsGrietasC2,
    eventsFiltracionesC2, eventsPresionPorosB3}});
}
