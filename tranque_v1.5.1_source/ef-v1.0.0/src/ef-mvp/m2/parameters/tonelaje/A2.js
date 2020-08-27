const { getPlanDepositacionProyecto } = require("common-modules/superation");

const TONELAJE_YES = true;
const TONELAJE_NO = false;

let errorPermitidoValue = undefined;
let errorPermitido = await refs.param("error-permitido-tonelaje-plan-depositacion-proyecto");
if (utils.isDefined(errorPermitido["error-permitido-tonelaje-plan-depositacion-proyecto"])) {
  errorPermitido = errorPermitido["error-permitido-tonelaje-plan-depositacion-proyecto"];
  errorPermitidoValue = errorPermitido.value;
}
else {
  errorPermitidoValue = 4500;
}

let planDepositacionProyectoValue = undefined;
let planDepositacionProyecto = await refs.param("plan-depositacion-proyecto");
if (utils.isDefined(planDepositacionProyecto["plan-depositacion-proyecto"])) {
  planDepositacionProyecto = planDepositacionProyecto["plan-depositacion-proyecto"];
  planDepositacionProyectoValue = planDepositacionProyecto;
}
else {
  planDepositacionProyectoValue = {
    value: {
      curve:[
        {date: "2016-03-01", value: 100000},
        {date: "2016-06-01", value: 105500},
        {date: "2016-09-01", value: 111000},
        {date: "2016-12-01", value: 116500},
        {date: "2017-03-01", value: 122000},
        {date: "2017-06-01", value: 127500},
        {date: "2017-09-01", value: 133000},
        {date: "2017-12-01", value: 138500},
        {date: "2018-03-01", value: 144000},
        {date: "2018-06-01", value: 149500},
        {date: "2018-09-01", value: 155500},
        {date: "2018-12-01", value: 160500},
        {date: "2019-03-01", value: 166000},
        {date: "2019-06-01", value: 171500},
        {date: "2019-09-01", value: 177000},
        {date: "2019-12-01", value: 182500},
        {date: "2020-03-01", value: 188000},
        {date: "2020-06-01", value: 193500},
      ]
    }
  };
}

const tonelaje = await series.query({head: "*.tonelaje"});
const tonelajeValue = tonelaje.value;

if (utils.isDefined(errorPermitido) &&
  utils.isDefined(planDepositacionProyecto) &&
  utils.isDefined(tonelaje) &&
  utils.isDefined(tonelaje['@timestamp'])) {

  let depositacionValue = getPlanDepositacionProyecto(planDepositacionProyectoValue, tonelaje['@timestamp']);

  const depositacionValue_errorPermitidoValue = parseFloat(depositacionValue) - parseFloat(errorPermitidoValue)
  let presenciaEventA2 = undefined;
  if (depositacionValue_errorPermitidoValue > parseFloat(tonelajeValue))
    presenciaEventA2 = TONELAJE_YES;
  else
    presenciaEventA2 = TONELAJE_NO;

  series.yield(presenciaEventA2, {meta: {depositacionValue, errorPermitidoValue, depositacionValue_errorPermitidoValue, tonelajeValue}});
}
