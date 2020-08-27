const {value, meta: {valid}} = utils.assert(await series.query({head: "*"}));
series.yield(value > 0 && valid, {meta: {value, valid}});
