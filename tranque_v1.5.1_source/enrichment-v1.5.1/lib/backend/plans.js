const Sequelize = require("sequelize");

const models = require("./models");

const planHas = (plan, node) => plan.indexOf(node) !== -1;

module.exports = async (tss) => {
  if (tss.length === 0) {
    return [];
  }
  const ids = await models.Timeseries.findAll({
    attributes: ["id", "canonical_name"],
    where: {canonical_name: {[Sequelize.Op.in]: tss}},
  });
  const idMap = ids.reduce(
    (mapping, {id, canonical_name}) => ({...mapping, [canonical_name]: id}),
    {}
  );
  const missing = tss.filter((ts) => typeof idMap[ts] === "undefined");
  if (missing.length > 0) {
    throw new Error(`non-existent time series: ${missing.join(", ")}`);
  }

  const edgePool = new Map();

  const collectGraph = async (node, nodes, edges) => {
    nodes.add(node);
    edges.set(node, edges.get(node) || new Set());
    const children = await (edgePool.has(node)
      ? Promise.resolve(edgePool.get(node))
      : models.TimeseriesInput.findAll({
          attributes: [["from_timeseries_id", "id"]],
          where: {to_timeseries_id: node},
        }).then((timeseries) => new Set(timeseries.map((t) => t.id))));
    edgePool.set(node, children);

    // prefetch the children edges
    const adultChildren = Array.from(children).filter((child) => !edgePool.has(child));
    const grandChildren = await (adultChildren.length === 0
      ? new Map()
      : models.TimeseriesInput.findAll({
          attributes: [
            ["to_timeseries_id", "to_id"],
            ["from_timeseries_id", "from_id"],
          ],
          where: {
            to_timeseries_id: {
              [Sequelize.Op.in]: adultChildren,
            },
          },
        }).then((timeseries) =>
          timeseries.reduce((map, {to_id, from_id}) => {
            const edgeList = map.get(to_id) || [];
            edgeList.push(from_id);
            map.set(to_id, edgeList);
            return map;
          }, new Map())
        ));

    adultChildren
      .filter((child) => grandChildren.has(child))
      .forEach((child) => edgePool.set(child, new Set(grandChildren.get(child))));

    await Array.from(children).reduce(async (p, child) => {
      await p;
      edges.get(node).add(child);
      await (nodes.has(child)
        ? Promise.resolve(null)
        : collectGraph(child, nodes, edges));
    }, Promise.resolve(null));
    return {nodes, edges};
  };

  const graphs = await tss
    .map((name) => idMap[name])
    .reduce(async (p, node) => {
      const previous = await p;
      const graph = await collectGraph(node, new Set(), new Map());
      return [...previous, {node, graph}];
    }, Promise.resolve([]));

  // Topological sort
  const plans = graphs.map(({node, graph: {nodes, edges}}) => {
    const reversedEdges = new Map(
      Array.from(nodes).map((target) => [
        target,
        new Set(Array.from(nodes).filter((n) => (edges.get(n) || new Set()).has(target))),
      ])
    );
    let plan = [node];
    const candidates = edges.get(node) || new Set();
    while (candidates.size > 0) {
      let changed = false;
      Array.from(candidates).forEach((n) => {
        if (
          !planHas(plan, n) &&
          Array.from(reversedEdges.get(n)).every((trace) => planHas(plan, trace))
        ) {
          changed = true;
          plan.push(n);
          Array.from(edges.get(n) || new Set()).forEach((subnode) => {
            if (!planHas(plan, subnode)) {
              candidates.add(subnode);
            }
          });
          candidates.delete(n);
        }
      });
      if (!changed) {
        plan = [
          ...plan,
          ...Array.from(candidates).filter((candidate) => !planHas(plan, candidate)),
        ];
        candidates.clear();
      }
    }
    return plan;
  });

  const names = await models.Timeseries.findAll({
    attributes: ["id", "canonical_name"],
    where: {
      id: {
        [Sequelize.Op.in]: Array.from(new Set(plans.flat())),
      },
    },
  });
  const nameMap = names.reduce(
    (mapping, {id, canonical_name}) => ({...mapping, [id]: canonical_name}),
    {}
  );
  return plans.map((plan) => plan.slice(1).map((node) => nameMap[node]));
};
