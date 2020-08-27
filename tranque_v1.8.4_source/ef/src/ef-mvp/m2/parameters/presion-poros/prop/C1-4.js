const {baseCriterion} = require("./C1-234-base");

const [event, others] = await baseCriterion(2);
series.yield(event, {meta: {others}});
