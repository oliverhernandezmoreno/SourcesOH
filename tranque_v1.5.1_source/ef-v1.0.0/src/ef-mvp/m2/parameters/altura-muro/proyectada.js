const {pointInCurve} = require("common-modules/linear-interpolation");

const planCrecimiento = await refs.getParameter("plan-crecimiento-altura-coronamiento");

const altura = await series.query({head: "*"});

if (utils.isDefined(altura) &&  // hay altura medida
    planCrecimiento !== null &&  // hay plan de crecimiento
    utils.isDefined(planCrecimiento.value.curve) &&  // el plan de crecimiento está definido
    planCrecimiento.value.curve.length > 0) {  // el plan de crecimiento tiene al menos un elemento

  const curve = planCrecimiento.value.curve.filter(
    ({group}) => utils.isUndefined(group) || // el grupo no está definido
      group === null ||
      ctx.rootRef.data_source.groups.indexOf(group) !== -1 // o es algún grupo de la serie
  );

  series.yield(pointInCurve(
    curve,
    (new Date(altura["@timestamp"])).getTime(),
    ({date, value}) => [(new Date(date)).getTime(), value],
    // en caso de duplicados, seleccionar el más específico (con grupo)
    ((candidates) => {
      const withGroup = candidates.find(({group}) => utils.isDefined(group) && group !== null);
      if (utils.isDefined(withGroup)) {
        return withGroup;
      }
      return candidates[0];
    })
  ));
}
