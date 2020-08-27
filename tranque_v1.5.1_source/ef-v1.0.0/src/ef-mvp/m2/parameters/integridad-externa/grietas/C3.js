const ATENTA_ESTABILIDAD = 1;
const DESLIZAMIENTO = 1;

const grieta = await series.query({head: "*.grietas"});
const deslizamiento = await series.query({head: "*.deslizamiento-activacion-manual"});


if (utils.isDefined(grieta) && utils.isDefined(deslizamiento)) {
  series.yield(
    ~~(grieta.value === ATENTA_ESTABILIDAD && deslizamiento.value === DESLIZAMIENTO),
    {meta: {grieta, deslizamiento}}
  );
}
