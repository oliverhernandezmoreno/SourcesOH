const ingresoReal = (await series.query({head: "*.ingreso-real-acumulado"})) || {value: 0};
const ingresoPronosticado = await series.query({head: "*.ingreso-pronosticado"});

const pronosticos = ((ingresoPronosticado || {}).meta || {}).pronosticos || [];

series.yield(
  ingresoReal.value + pronosticos.reduce((partial, p) => partial + p.value, 0),
  {meta: {
    ingresoReal: ingresoReal.value,
    pronosticos
  }},
);
