// Es la diferencia de 100% con el acumulado en orden de menor milimetro
// a mayor milimetro

const totals = await series.query({head: "*", all: true});

if (utils.isDefined(totals)) {
  for (const val of totals) {
    if (utils.isDefined(val.meta) && utils.isDefined(val.meta.parcial)) {
      let acumulado = 0;
      const acumuladoPasante = val.meta.parcial
        .sort((a, b) => {
          if(!utils.isDefined(b.abertura)) b.abertura = 0;
          if(!utils.isDefined(a.abertura)) a.abertura = 0;
          return b.abertura - a.abertura;
        })
        .map((parcial) => {
          acumulado += parcial.porcentaje;
          return {malla: parcial.malla,
              porcentaje: (100 - acumulado),
              abertura: parcial.abertura};
        });
      const meta = {};
      meta["muestra"] = val.meta.muestra;
      meta["acumulado-pasante"] = acumuladoPasante;
      series.yield(acumulado, {meta});
    }
  }
}
