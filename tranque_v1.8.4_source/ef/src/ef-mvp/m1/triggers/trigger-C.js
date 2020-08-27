const {value} = utils.assert(await series.query({head: "*"}));
series.yield(value > 0 && value <= 1);
