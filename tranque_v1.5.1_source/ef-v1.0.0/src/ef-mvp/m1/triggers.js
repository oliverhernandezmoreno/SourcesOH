const events = await series.queryAll({head: "*"});
const sum = events
      .filter(utils.isDefined)
      .reduce((partial, event) => partial + event.value, 0);
series.yield(sum);
