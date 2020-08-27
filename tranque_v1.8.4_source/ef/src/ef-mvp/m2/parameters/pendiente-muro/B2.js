const porcentaje = await refs.getParameter("porcentaje-cercania-pendiente-aguas-arriba");

const perfil = await refs.getOne("*");
const umbral = perfil.active_thresholds
      .filter(({lower}) => lower !== null)
      .map(({lower}) => parseFloat(lower))
      .sort((u1, u2) => u1 - u2)[0];

const pendiente = await series.query({head: "*"});

if (utils.isDefined(umbral) && utils.isDefined(pendiente)) {
  const alfa = porcentaje === null ? 0 : porcentaje.value;
  series.yield(~~(pendiente.value < umbral * (1 + alfa)), {meta: {
    pendiente: pendiente.value,
    alfa,
    umbral
  }});
}
