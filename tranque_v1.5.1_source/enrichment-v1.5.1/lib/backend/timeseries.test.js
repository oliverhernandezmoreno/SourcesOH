/* global expect, test */
const timeseries = require("./timeseries");

test("single queries", async () => {
  // time series without data source
  const [ts1] = await timeseries([
    "el-mauro.none.ef-mvp.m2.normalized-parameters.revancha-hidraulica",
  ]);
  expect(ts1).toBeTruthy();
  expect(ts1.canonical_name).toEqual(
    "el-mauro.none.ef-mvp.m2.normalized-parameters.revancha-hidraulica"
  );
  expect(ts1.data_source).toBeFalsy();

  // time series with a data source, which doesn't belong to a group
  const [ts2] = await timeseries([
    "el-mauro.s-CPTU-10.ef-mvp.m2.parameters.presion-poros",
  ]);
  expect(ts2).toBeTruthy();
  expect(ts2.canonical_name).toEqual(
    "el-mauro.s-CPTU-10.ef-mvp.m2.parameters.presion-poros"
  );
  expect(ts2.data_source).toBeTruthy();
  expect(ts2.data_source.hardware_id).toEqual("CPTU-10");
  expect(ts2.data_source.groups.length).toEqual(0);

  // time series with data sources, which belong to groups
  const [ts3] = await timeseries([
    "el-mauro.s-CPTU-6.ef-mvp.m2.parameters.presion-poros",
  ]);
  expect(ts3).toBeTruthy();
  expect(ts3.canonical_name).toEqual(
    "el-mauro.s-CPTU-6.ef-mvp.m2.parameters.presion-poros"
  );
  expect(ts3.data_source).toBeTruthy();
  expect(ts3.data_source.hardware_id).toEqual("CPTU-6");
  expect(ts3.data_source.groups).toEqual(["piezometros"]);

  const [ts4] = await timeseries(["el-mauro.s-PZ-4.ef-mvp.m2.parameters.presion-poros"]);
  expect(ts4).toBeTruthy();
  expect(ts4.canonical_name).toEqual(
    "el-mauro.s-PZ-4.ef-mvp.m2.parameters.presion-poros"
  );
  expect(ts4.data_source).toBeTruthy();
  expect(ts4.data_source.hardware_id).toEqual("PZ-4");
  expect(ts4.data_source.groups.sort()).toEqual([
    "piezometros",
    "piezometros-fibra-optica",
  ]);
});

test("multiple query", async () => {
  const [ts1, ts2, ts3, ts4] = await timeseries([
    "el-mauro.none.ef-mvp.m2.normalized-parameters.revancha-hidraulica",
    "el-mauro.s-CPTU-10.ef-mvp.m2.parameters.presion-poros",
    "el-mauro.s-CPTU-6.ef-mvp.m2.parameters.presion-poros",
    "el-mauro.s-PZ-4.ef-mvp.m2.parameters.presion-poros",
  ]);

  expect(ts1).toBeTruthy();
  expect(ts1.canonical_name).toEqual(
    "el-mauro.none.ef-mvp.m2.normalized-parameters.revancha-hidraulica"
  );
  expect(ts1.data_source).toBeFalsy();

  expect(ts2).toBeTruthy();
  expect(ts2.canonical_name).toEqual(
    "el-mauro.s-CPTU-10.ef-mvp.m2.parameters.presion-poros"
  );
  expect(ts2.data_source).toBeTruthy();
  expect(ts2.data_source.hardware_id).toEqual("CPTU-10");
  expect(ts2.data_source.groups.length).toEqual(0);

  expect(ts3).toBeTruthy();
  expect(ts3.canonical_name).toEqual(
    "el-mauro.s-CPTU-6.ef-mvp.m2.parameters.presion-poros"
  );
  expect(ts3.data_source).toBeTruthy();
  expect(ts3.data_source.hardware_id).toEqual("CPTU-6");
  expect(ts3.data_source.groups).toEqual(["piezometros"]);

  expect(ts4).toBeTruthy();
  expect(ts4.canonical_name).toEqual(
    "el-mauro.s-PZ-4.ef-mvp.m2.parameters.presion-poros"
  );
  expect(ts4.data_source).toBeTruthy();
  expect(ts4.data_source.hardware_id).toEqual("PZ-4");
  expect(ts4.data_source.groups.sort()).toEqual([
    "piezometros",
    "piezometros-fibra-optica",
  ]);
});

test("consistent validity intervals", async () => {
  const [ts] = await timeseries(["el-mauro.s-PZ-4.ef-mvp.m2.parameters.presion-poros"]);
  for (let interval of ts.validity_intervals) {
    expect(
      interval.from === "__BoT__" ||
        interval.to === "__EoT__" ||
        interval.from < interval.to
    ).toBeTruthy();
  }
});
