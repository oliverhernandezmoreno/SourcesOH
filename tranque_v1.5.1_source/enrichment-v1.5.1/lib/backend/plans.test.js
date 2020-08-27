/* global expect, test */
const crypto = require("crypto");

const models = require("./models");
const plans = require("./plans");

const randomName = () => crypto.randomBytes(6).toString("hex");

const getTargetId = async () =>
  models.Target.findOne({attributes: ["id"]}).then((t) => t.id);

const createNode = async (targetId) =>
  models.Timeseries.create({
    name: "Test time series",
    type: "derived",
    canonical_name: randomName(),
    target_id: targetId,
  });

const link = async (n1, n2) =>
  models.TimeseriesInput.create({
    from_timeseries_id: n2.id,
    to_timeseries_id: n1.id,
  });

test("handles a trivial cyclical graph", async () => {
  const targetId = await getTargetId();
  const n1 = await createNode(targetId);
  const n2 = await createNode(targetId);
  await link(n1, n2);
  await link(n2, n1);
  const [plan1] = await plans([n1.canonical_name]);
  expect(plan1).toEqual([n2].map((n) => n.canonical_name));
  const [plan2] = await plans([n2.canonical_name]);
  expect(plan2).toEqual([n1].map((n) => n.canonical_name));
});

test("handles a large cyclical graph", async () => {
  const targetId = await getTargetId();
  const n1 = await createNode(targetId);
  const n2 = await createNode(targetId);
  const n3 = await createNode(targetId);
  const n4 = await createNode(targetId);
  await link(n1, n2);
  await link(n2, n3);
  await link(n3, n4);
  await link(n4, n1);
  const [plan] = await plans([n1.canonical_name]);
  expect(plan).toEqual([n2, n3, n4].map((n) => n.canonical_name));
});

test("handles a non cyclical graph", async () => {
  const targetId = await getTargetId();
  const a = await createNode(targetId);
  const b = await createNode(targetId);
  const c = await createNode(targetId);
  const d = await createNode(targetId);
  const e = await createNode(targetId);
  await link(a, b);
  await link(a, d);
  await link(b, d);
  await link(b, c);
  await link(d, c);
  await link(d, e);
  const [plan] = await plans([a.canonical_name]);
  expect(
    plan.join(", ") === [b, d, c, e].map((n) => n.canonical_name).join(", ") ||
      plan.join(", ") === [b, d, e, c].map((n) => n.canonical_name).join(", ")
  ).toBeTruthy();
});

test("handles several graphs simultaneously", async () => {
  const targetId = await getTargetId();
  const n1 = await createNode(targetId);
  const n2 = await createNode(targetId);
  const n3 = await createNode(targetId);
  const n4 = await createNode(targetId);
  await link(n1, n2);
  await link(n2, n3);
  await link(n3, n4);
  await link(n2, n4);
  const [plan1, plan2] = await plans([n1.canonical_name, n2.canonical_name]);
  expect(plan1).toEqual([n2, n3, n4].map((n) => n.canonical_name));
  expect(plan2).toEqual([n3, n4].map((n) => n.canonical_name));
});
