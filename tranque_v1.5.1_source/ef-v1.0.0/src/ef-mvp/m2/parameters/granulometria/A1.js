
const curvaSuperior = await refs.param("banda-granulometrica-superior");
const curvaInferior = await refs.param("banda-granulometrica-inferior");

if (curvaSuperior === null) {
  utils.debug("Curva de banda de granulometria superior no existe");
  return;
}
if (curvaInferior === null) {
  utils.debug("Curva de banda de granulometria inferior no existe");
  return;
}

const acumuladosPasante = await series.query({head: "*.acumulado-pasante-por-muestra", all: true});

// interpolate using barycentrics
const {pointInCurve: interpolate} = require("common-modules/linear-interpolation");

if (utils.isDefined(acumuladosPasante)) {
  let results = [];
  acumuladosPasante.forEach((acumulado) => {
    let superior = acumulado.meta['acumulado-pasante'].map((ptje) => {
      if (utils.isDefined(ptje.abertura) && ptje.abertura > 0) {
        const interSuperior = interpolate(
          curvaSuperior.curve.map(({abertura, pasa}) => [abertura.value, pasa.value]),
          ptje.abertura
        );
        return { superior: ptje.porcentaje > interSuperior, malla: ptje.malla,
                  porcentaje: ptje.porcentaje, abertura: ptje.abertura,
                  muestra: acumulado.meta.muestra, interSuperior };
      }
    }).reduce((acum, iter) => {
      if (acum === undefined) acum = [];
      if (iter !== undefined && utils.isDefined(iter.superior) && iter.superior)
        acum.push(iter);
      return acum;
    }, []);

    let inferior = acumulado.meta['acumulado-pasante'].map((ptje) => {
      if (utils.isDefined(ptje.abertura) && ptje.abertura > 0) {
        const interInferior = interpolate(
          curvaInferior.curve.map(({abertura, pasa}) => [abertura.value, pasa.value]),
          ptje.abertura
        );
        return { inferior: ptje.porcentaje < interInferior, malla: ptje.malla,
                  porcentaje: ptje.porcentaje, abertura: ptje.abertura,
                  muestra: acumulado.meta.muestra, interInferior };
      }
    }).reduce((acum, iter) => {
      if (acum === undefined) acum = [];
      if (iter !== undefined && utils.isDefined(iter.inferior) && iter.inferior)
        acum.push(iter);
      return acum;
    }, []);
    results = results.concat(superior, inferior);
  });

  series.yield( ~~(results.length > 0), {meta: {results: results}});

}
