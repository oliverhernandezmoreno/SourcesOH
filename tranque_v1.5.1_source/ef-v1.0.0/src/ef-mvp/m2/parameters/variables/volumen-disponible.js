const {pointInCurve} = require("common-modules/linear-interpolation");

const curvaEmbalse = await refs.param("curva-embalse");
const curvaCapacidad = await refs.param("curva-capacidad-volumen-disponible");

if (curvaCapacidad === null) {
  utils.debug("Curva de capacidad no existe");
  return;
}

const [
  cotaLamas,
  cotaCoronamiento
] = await series.query([
  {head: "*.cota-lamas.minimo"},
  {head: "*.altura-muro.minimo"}
]);

if (utils.isUndefined(cotaCoronamiento)) {
  utils.debug("No hay cota de coronamiento");
  return;
}

if (utils.isUndefined(cotaLamas)) {
  utils.debug("No hay cota de coronamiento");
  return;
}

const volumenTotal = pointInCurve(
  curvaCapacidad.curve.map(({cotaCoronamiento, volumen}) => [cotaCoronamiento, volumen]),
  cotaCoronamiento.value
);

const volumenTotalAntesMuro = pointInCurve(
  curvaCapacidad.curve.map(({cotaCoronamiento, volumen}) => [cotaCoronamiento, volumen]),
  cotaLamas.value
);

const volumenOcupado = curvaEmbalse !== null && curvaEmbalse.value !== null ?
      pointInCurve(
        curvaEmbalse.curve.map(({cotaCoronamiento, volumen}) => [cotaCoronamiento, volumen]),
        cotaCoronamiento.value
      ) :
      volumenTotalAntesMuro;

series.yield(volumenTotal - volumenOcupado, {meta: {
  volumenTotal,
  volumenOcupado,
  curvaEmbalse: curvaEmbalse === null ? null : curvaEmbalse.curve,
  curvaCapacidad: curvaCapacidad.curve,
  cotaLamas: utils.isDefined(cotaLamas) ? cotaLamas.value : null,
  cotaCoronamiento: cotaCoronamiento.value,
  volumenDisponibleAntesDeMuro: volumenTotalAntesMuro - volumenOcupado
}});
