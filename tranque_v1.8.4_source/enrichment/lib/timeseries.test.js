/* global expect, test */
const moment = require("moment");

const timeseries = require("./timeseries");
const {genName, search} = require("./test-utils");

test("duplicate events are overridden", async () => {
  const now = new Date();
  const nameOne = genName();
  // first and last are 'equal'
  const sliceOne = [
    {"name": nameOne, "value": 111, "@timestamp": now},
    {"name": nameOne, "value": 222, "@timestamp": now, "coords": {x: 7}},
    {"name": nameOne, "value": 333, "@timestamp": now},
  ];
  await timeseries.saveEvents(sliceOne);
  const savedOne = await search(nameOne, 10);
  expect(savedOne.map((e) => e.value).sort()).toEqual([222, 333]);

  const nameTwo = genName();
  // two slices, collisions ocurr between slices
  const sliceTwoA = [
    {"name": nameTwo, "value": 1, "@timestamp": now},
    {"name": nameTwo, "value": 2, "@timestamp": now, "coords": {x: 7}},
  ];
  const sliceTwoB = [
    {"name": nameTwo, "value": 5, "@timestamp": now, "coords": {x: 9}},
    {"name": nameTwo, "value": 3, "@timestamp": now, "coords": {x: 7}},
  ];
  await timeseries.saveEvents(sliceTwoA);
  await timeseries.saveEvents(sliceTwoB);
  const savedTwo = await search(nameTwo, 10);
  expect(savedTwo.map((e) => e.value).sort()).toEqual([1, 3, 5]);
});

test("dependent events are correctly identified and removed", async () => {
  const now = new Date().toJSON();
  const names = Array.from(new Array(25).keys()).map((i) => `${genName()}-${i}`);
  const independentRawEvents = names.map((name) => ({
    name,
    "@timestamp": now,
    "value": 4321,
  }));
  const dependentRawEvents = names.flatMap((name) => [
    {name, "@timestamp": moment(now).clone().add(1, "seconds").toJSON(), "value": 321},
    {name, "@timestamp": moment(now).clone().add(2, "seconds").toJSON(), "value": 321},
    {name, "@timestamp": moment(now).clone().add(3, "seconds").toJSON(), "value": 321},
    {name, "@timestamp": moment(now).clone().add(4, "seconds").toJSON(), "value": 321},
    {name, "@timestamp": moment(now).clone().add(5, "seconds").toJSON(), "value": 321},
    {name, "@timestamp": moment(now).clone().add(6, "seconds").toJSON(), "value": 321},
    {name, "@timestamp": moment(now).clone().add(7, "seconds").toJSON(), "value": 321},
    {name, "@timestamp": moment(now).clone().add(8, "seconds").toJSON(), "value": 321},
    {name, "@timestamp": moment(now).clone().add(9, "seconds").toJSON(), "value": 321},
  ]);
  const independentEvents = await timeseries.saveEvents(
    independentRawEvents,
    "test-message-1",
    ["invalid-id", "fake-dependency", "blago-blags"]
  );
  const dependentEvents = await timeseries.saveEvents(
    dependentRawEvents,
    "test-message-2",
    // at most three random dependencies
    Array.from(
      new Set(
        [Math.random(), Math.random(), Math.random()]
          .map((r) => ~~(r * independentEvents.length))
          .map((i) => independentEvents[i]._id)
      )
    )
  );
  // Delete all events depending on any other event, and expect only
  // the dependent ones to be gone afterwards.
  await timeseries.removeDependent([...independentEvents, ...dependentEvents]);
  const persistent = await names.reduce(
    (prev, n) => prev.then((p) => search(n, 1000).then((evs) => [...p, ...evs])),
    Promise.resolve([])
  );
  expect(persistent.map((e) => e._id)).toEqual(independentEvents.map((e) => e._id));
  expect(Array.from(new Set(persistent.map((e) => e.value)))).toEqual([4321]);
});

test("index digestion works as expected", async () => {
  const date = new Date(1999, 9, 2).toJSON();
  const index = "derived-1999.10";
  const name = `digest-${genName()}`;
  const events = await timeseries.saveEvents([
    {name, "@timestamp": moment(date).toJSON(), "value": 123},
    {name, "@timestamp": moment(date).add(1, "seconds").toJSON(), "value": 123},
    {name, "@timestamp": moment(date).add(2, "seconds").toJSON(), "value": 123},
    {name, "@timestamp": moment(date).add(3, "seconds").toJSON(), "value": 123},
    {name, "@timestamp": moment(date).add(4, "seconds").toJSON(), "value": 123},
    {name, "@timestamp": moment(date).add(5, "seconds").toJSON(), "value": 123},
    {name, "@timestamp": moment(date).add(6, "seconds").toJSON(), "value": 123},
  ]);
  // All events start at version 1
  for (let e of events) {
    const event = await timeseries.client.get({
      id: e._id,
      index,
    });
    expect(event._version).toEqual(1);
  }

  // Digest over three pages
  await timeseries.digest("derived-1999.10", 3);
  // All events have version 2
  for (let e of events) {
    const event = await timeseries.client.get({
      id: e._id,
      index,
    });
    expect(event._version).toEqual(2);
  }
});
