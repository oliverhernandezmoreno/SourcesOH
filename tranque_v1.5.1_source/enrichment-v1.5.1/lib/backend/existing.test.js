/* global expect, test, beforeEach, afterEach */
const models = require("./models");
const existing = require("./existing");

const BATCH_SIZE = 30;

const objects = [];

beforeEach(async () => {
  const target = await models.Target.findOne();
  const sourceActive = await models.DataSource.create({
    target_id: target.id,
    hardware_id: "test-active-datasource",
    name: "test",
    canonical_name: "test",
    active: true,
  });
  objects.push(sourceActive);
  const sourceInactive = await models.DataSource.create({
    target_id: target.id,
    hardware_id: "test-inactive-datasource",
    name: "test",
    canonical_name: "test",
    active: false,
  });
  objects.push(sourceInactive);

  // Active both at the time series and data source level
  for (let index of Array.from(Array(BATCH_SIZE).keys())) {
    const ts = await models.Timeseries.create({
      target_id: target.id,
      // unlink half of them from the data sources
      data_source_id: index % 2 === 0 ? sourceActive.id : null,
      active: true,
      canonical_name: `test-timeseries-active-${index}`,
      name: "test",
      type: "test",
    });
    objects.push(ts);
  }
  // Inactive directly at the timeseries level
  for (let index of Array.from(Array(BATCH_SIZE).keys())) {
    const ts = await models.Timeseries.create({
      target_id: target.id,
      data_source_id: sourceActive.id,
      active: false,
      canonical_name: `test-timeseries-inactive-${index}`,
      name: "test",
      type: "test",
    });
    objects.push(ts);
  }
  // Inactive by inheritance through the data source
  for (let index of Array.from(Array(BATCH_SIZE).keys())) {
    const ts = await models.Timeseries.create({
      target_id: target.id,
      data_source_id: sourceInactive.id,
      active: true,
      canonical_name: `test-timeseries-inherited-inactive-${index}`,
      name: "test",
      type: "test",
    });
    objects.push(ts);
  }
});

const allNames = [
  ...Array.from({length: BATCH_SIZE}, (_, index) => `test-timeseries-active-${index}`),
  ...Array.from({length: BATCH_SIZE}, (_, index) => `test-timeseries-inactive-${index}`),
  ...Array.from(
    {length: BATCH_SIZE},
    (_, index) => `test-timeseries-inherited-inactive-${index}`
  ),
];

afterEach(async () => {
  for (let obj of objects.slice().reverse()) {
    await obj.destroy();
  }
});

test("existing timeseries lookup finds the expected timeseries", async () => {
  const found = Array.from(await existing(allNames)).sort();
  expect(found).toEqual(
    allNames.filter((name) => name.startsWith("test-timeseries-active")).sort()
  );
});
