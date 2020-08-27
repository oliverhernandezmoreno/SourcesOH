const VERTEDERO_NO_OPERATIVO_YES = + true;  // 1
const FORECAST_LLUVIA_YES = + true;  // 1
const ESTADO_LLUVIA_YES = + true;  // 1

const lastVertederoNoOperativo = await series.query({head: "*.vertedero-no-operativo"});
const lastForecastLluvia = await series.query({head: "*.forecasts.lluvia"});
const lastEstadoLluvia = await series.query({head: "*.estado-lluvia"});

if (utils.isDefined(lastVertederoNoOperativo) &&
  utils.isDefined(lastForecastLluvia) &&
  utils.isDefined(lastEstadoLluvia))
  series.yield(lastVertederoNoOperativo.value === VERTEDERO_NO_OPERATIVO_YES &&
    (lastForecastLluvia.value === FORECAST_LLUVIA_YES ||
    lastEstadoLluvia.value === ESTADO_LLUVIA_YES), {meta: {lastVertederoNoOperativo, lastForecastLluvia, lastEstadoLluvia}})
