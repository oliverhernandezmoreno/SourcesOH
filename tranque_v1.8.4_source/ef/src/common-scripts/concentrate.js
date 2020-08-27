// Concentrate measurements and metadata
const heads = (await series.queryAll({head: "*"})).filter(utils.isDefined);
const vars = await refs.getMany("*");
series.yield(0, {meta: {vars, heads}});
