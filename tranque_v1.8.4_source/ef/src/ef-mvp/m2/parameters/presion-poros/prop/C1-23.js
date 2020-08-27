const {baseCriterion} = require("./C1-234-base");

const [event, others] = await baseCriterion(1);
series.yield(event, {meta: {others}});
