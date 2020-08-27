const [crAguasArriba, crAguasAbajo] = await series.query([
  {head: "*.aguas-arriba.*"},
  {head: "*.aguas-abajo.*"},
]);

if (utils.isDefined(crAguasArriba) &&
    utils.isDefined(crAguasAbajo)) {
  const vAguasArriba = crAguasArriba.value;
  const vAguasAbajo = crAguasAbajo.value;
  if (vAguasArriba !== null &&
      vAguasAbajo !== null &&
      vAguasArriba !== 0) {
    series.save(vAguasAbajo / vAguasArriba);
  }
}
