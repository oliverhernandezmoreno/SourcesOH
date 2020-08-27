const errorPermitido = await refs.getParameter("error-permitido-altura-coronamiento");

const [altura, proyectada] = await series.query([
  {head: "*.altura-muro"},
  {head: "*.proyectada"}
]);

if (utils.isDefined(altura) && utils.isDefined(proyectada)) {
  // la tolerancia es 0 por omisión
  const tolerancia = errorPermitido === null ? 0 : errorPermitido.value;
  series.yield(
    ~~((proyectada.value + tolerancia) <= altura.value),
    {meta: {altura: altura.value, proyectada: proyectada.value, tolerancia}}
  );
}
