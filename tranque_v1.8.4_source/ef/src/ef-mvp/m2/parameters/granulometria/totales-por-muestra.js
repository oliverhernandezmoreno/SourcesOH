
const lastDay = await series.query({head: "*"});

if (utils.isDefined(lastDay) && utils.isDefined(lastDay['@timestamp']) &&
  lastDay['@timestamp'] !== null) {

  const raws = await series.query({
    slice: "*",
    since: lastDay['@timestamp'],
    count: 1000
  });

  let totals = raws.reduce( (acum, raw) => {
    const muestra = raw.meta.muestra;
    const mallaT = raw.meta.malla;
    const abertura = raw.meta.abertura;
    const val = raw.value;
    if (!acum[muestra]) {
        acum[muestra] = {value: val, elements: []};
        const malla = {};
        malla["value"] = val;
        malla["malla"] = mallaT;
        malla["abertura"] = abertura;
        acum[muestra].elements.push(malla);
    } else {
        acum[muestra].value += val;
        const malla = {};
        malla["value"] = val;
        malla["malla"] = mallaT;
        malla["abertura"] = abertura;
        acum[muestra].elements.push(malla);
    }
    return acum;
  }, {});

  for (const [key, val] of Object.entries(totals)) {
    let meta = {};
    meta = val;
    meta["muestra"] = key;
    meta["parcial"] = [];
    const elements = val.elements.sort((a, b) => {
      if(!utils.isDefined(b.abertura)) b.abertura = 0;
      if(!utils.isDefined(a.abertura)) a.abertura = 0;
      return b.abertura - a.abertura;
    });

    elements.forEach((item) => {
      const ptj = {};
      ptj["malla"] = item.malla;
      ptj["porcentaje"] = item.value * 100 / val.value;
      ptj["abertura"] = item.abertura;
      meta["parcial"].push(ptj);
    });

    series.yield(val.value, {meta});
  }


}
