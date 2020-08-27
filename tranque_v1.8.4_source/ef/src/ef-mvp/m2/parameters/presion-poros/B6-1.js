const {value, meta: {valid}} = await series.query({head: "*"});
series.yield(value > 0 && valid, {meta: {value, valid}});
