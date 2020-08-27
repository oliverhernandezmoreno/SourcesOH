const heads = (await series.queryAll({head: "*"})).filter(utils.isDefined);

// event name -> variables emitting event
const table = {};

// the common prefix for a canonical name
const prefix = (n, name) => name.split(".").slice(0, -1 * n).join(".");

heads
  .filter(({value}) => value > 0)
  .forEach(({name, meta}) => {
    const event = name.split(".").slice(-1)[0];
    if (utils.isUndefined(table[event])) {
      table[event] = new Set();
    }
    table[event].add(prefix(2, name));
    (meta.others || []).forEach((n) => table[event].add(prefix(1, n)));
  });

series.yield(
  0,
  {
    meta: {
      table: Object.fromEntries(
        Object.entries(table).map(([k, v]) => [k, Array.from(v)])
      )
    }
  }
);
