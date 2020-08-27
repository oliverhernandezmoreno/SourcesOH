const porcentajeCercania = await refs.getParameter("porcentaje-cercania-revancha-operacional-maxima");

if (porcentajeCercania !== null &&
    porcentajeCercania.value !== null) {
  const ref = await refs.getOne("*");
  const threshold = ref.active_thresholds
        .filter(({kind, upper}) => kind === null && upper !== null)
        .map(({upper}) => parseFloat(upper))[0];

  if (utils.isDefined(threshold)) {
    const revancha = await series.query({head: "*"});
    series.yield(
      ~~(revancha.value >= threshold * (1 - porcentajeCercania.value)),
      {meta: {
        revancha: revancha.value,
        threshold,
        porcentajeCercania: porcentajeCercania.value
      }},
    );
  }
}
