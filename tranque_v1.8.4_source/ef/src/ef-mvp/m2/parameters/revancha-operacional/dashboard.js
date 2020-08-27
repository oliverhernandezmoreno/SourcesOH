const alturas = await series.queryAll({head: "*.altura-muro"});
const lamas = await series.queryAll({head: "*.cota-lamas"});

const umbralesPorPerfil = (await refs.getMany("*.revancha-operacional"))
      .filter((r) => r.data_source !== null)
      .map((r) => [r.data_source.id, r.active_thresholds])
      .reduce((acc, [k, v]) => ({...acc, [k]: v}), {});

const alturaRefs = (await refs.getMany("*.altura-muro")).filter(({data_source}) => data_source !== null);
const alturaMinima = alturas
      .filter(({name}) => utils.isDefined(alturaRefs.find(({canonical_name}) => name === canonical_name)))
      .sort((a1, a2) => a1.value - a2.value)[0];

if (utils.isUndefined(alturaMinima) || lamas.length === 0) {
  return;
}

const refAlturaMinima = await refs.getOne(alturaMinima.name);

const promedioLamas = lamas.reduce((partial, c) => partial + c.value, 0) / lamas.length;

series.yield(alturaMinima.value - promedioLamas, {meta: {
  coronamiento: alturaMinima.value,
  cotaLamas: promedioLamas,
  umbrales: umbralesPorPerfil[refAlturaMinima.data_source.id] || []
}});
