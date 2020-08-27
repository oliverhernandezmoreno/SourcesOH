const {meta: {table}} = await series.query({head: "*.prop"});
const eventName = ctx.rootRef.canonical_name.split(".").slice(-1)[0];
const prefix = ctx.rootRef.canonical_name.split(".").slice(0, -1).join(".");

series.yield(
  utils.isDefined(table[eventName]) &&
    table[eventName].indexOf(prefix) !== -1
);
