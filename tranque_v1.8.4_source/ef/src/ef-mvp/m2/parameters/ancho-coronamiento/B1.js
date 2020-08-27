const perfil = await refs.getOne("*");
const umbral = perfil.active_thresholds
      .filter(({lower}) => lower !== null)
      .map(({lower}) => parseFloat(lower))
      .sort((u1, u2) => u1 - u2)[0];

const ancho = await series.query({head: "*"});

if (utils.isDefined(umbral) && utils.isDefined(ancho)) {
  series.yield(~~(ancho.value <= umbral), {meta: {umbral}});
}
