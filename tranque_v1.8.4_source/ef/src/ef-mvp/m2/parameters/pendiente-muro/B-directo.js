const perfil = await refs.getOne("*");
const umbral = perfil.active_thresholds
      .filter(({lower}) => lower !== null)
      .map(({lower}) => parseFloat(lower))
      .sort((u1, u2) => u1 - u2)[0];

const pendiente = await series.query({head: "*"});

if (utils.isDefined(umbral) && utils.isDefined(pendiente)) {
  series.yield(~~(pendiente.value < umbral), {meta: {
    pendiente: pendiente.value,
    umbral
  }});
}
