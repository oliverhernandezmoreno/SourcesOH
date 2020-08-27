const perfil = await refs.getOne("*");
const umbral = perfil.active_thresholds
      .filter(({lower}) => lower !== null)
      .map(({lower}) => parseFloat(lower))
      .sort((u1, u2) => u1 - u2)[0];

const slice = series.current("*");

if (utils.isDefined(umbral) && slice.length > 0) {
  const superaciones = slice.filter((e) => e.value <= umbral);
  series.yield(~~(superaciones.length > 0), {meta: {superaciones}});
}
