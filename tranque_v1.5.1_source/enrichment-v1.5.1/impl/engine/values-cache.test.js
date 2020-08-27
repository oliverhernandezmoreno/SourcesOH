/* global expect, test */
const {
  packagedDependencies: {timeseries, conf},
} = require("../../lib/handler");
const {ValuesCache} = require("./values-cache");
const {indexMany, genName, makeEvent} = require("../../lib/test-utils");

const query = (cache, q) => cache.resolve([q(cache)]).then((results) => results[0]);
const mquery = (cache, q) => cache.resolve(q(cache));

test("a cached head", async () => {
  const name = genName();
  const events = [
    makeEvent(name, new Date(0).toJSON())(0.5),
    makeEvent(name, new Date(1).toJSON(), "super tag")(1.5),
    makeEvent(name, new Date(2).toJSON(), "super tag")(2.5),
    makeEvent(name, new Date(3).toJSON())(3.5),
  ];
  await indexMany(events);

  const cacheWithInitial = new ValuesCache(new Date().toJSON(), events, timeseries, conf);
  const receivedOne = await query(cacheWithInitial, (c) => c.head(name));
  expect(receivedOne.value).toEqual(3.5);
  expect(receivedOne._cached).toBeTruthy();

  const cacheWithoutInitial = new ValuesCache(new Date().toJSON(), [], timeseries, conf);
  const receivedTwo = await query(cacheWithoutInitial, (c) => c.head(name));
  expect(receivedTwo.value).toEqual(3.5);
  expect(receivedTwo._cached).toBeFalsy();

  const receivedThree = await query(cacheWithoutInitial, (c) => c.head(name));
  expect(receivedThree.value).toEqual(3.5);
  expect(receivedThree._cached).toBeTruthy();

  const receivedFour = await query(cacheWithoutInitial, (c) => c.head(name, "super tag"));
  expect(receivedFour.value).toEqual(2.5);
  expect(receivedFour._cached).toBeFalsy();

  const receivedFive = await query(cacheWithoutInitial, (c) => c.head(name, "super tag"));
  expect(receivedFive.value).toEqual(2.5);
  expect(receivedFive._cached).toBeTruthy();
});

test("a cached slice", async () => {
  const name = genName();
  const events = [
    makeEvent(name, new Date(0).toJSON())(0.5),
    makeEvent(name, new Date(1).toJSON(), "super tag")(1.5),
    makeEvent(name, new Date(2).toJSON(), "super tag")(2.5),
    makeEvent(name, new Date(3).toJSON())(3.5),
  ];
  await indexMany(events);

  const cache = new ValuesCache(new Date().toJSON(), events, timeseries, conf);
  const simpleSlice = await query(cache, (c) => c.slice(name, 4));
  expect(simpleSlice.map((event) => event.value)).toEqual([3.5, 2.5, 1.5, 0.5]);
  expect(simpleSlice.every((event) => event._cached)).toBeTruthy();

  const taggedSliceOne = await query(cache, (c) => c.slice(name, 2, "super tag"));
  expect(taggedSliceOne.map((event) => event.value)).toEqual([2.5, 1.5]);
  expect(taggedSliceOne.every((event) => event._cached)).toBeTruthy();

  const emptyCache = new ValuesCache(new Date().toJSON(), [], timeseries, conf);
  const taggedSliceTwo = await query(emptyCache, (c) => c.slice(name, 2, "super tag"));
  expect(taggedSliceTwo.map((event) => event.value)).toEqual([2.5, 1.5]);
  expect(taggedSliceTwo.every((event) => event._cached)).toBeFalsy();

  const taggedSliceThree = await query(emptyCache, (c) => c.slice(name, 2, "super tag"));
  expect(taggedSliceThree.map((event) => event.value)).toEqual([2.5, 1.5]);
  expect(taggedSliceThree.every((event) => event._cached)).toBeTruthy();
});

test("a complex cached slice", async () => {
  const name = genName();
  const events = [
    makeEvent(name, new Date(0).toJSON())(0.5),
    makeEvent(name, new Date(1).toJSON(), "super tag")(1.5),
    makeEvent(name, new Date(2).toJSON())(2.5),
    makeEvent(name, new Date(3).toJSON(), "super tag")(3.5),
    makeEvent(name, new Date(4).toJSON())(4.5),
    makeEvent(name, new Date(5).toJSON())(5.5),
  ];
  await indexMany(events);

  const since = new Date(1).toJSON();
  const until = new Date(4).toJSON();
  const cache = new ValuesCache(new Date().toJSON(), [], timeseries, conf);

  const sliceOne = await query(cache, (c) => c.sliceSinceUntil(name, since, until, 4));
  expect(sliceOne.map((event) => event.value)).toEqual([4.5, 3.5, 2.5, 1.5]);

  const sliceTwo = await query(cache, (c) => c.sliceSinceUntil(name, since, until, 4));
  expect(sliceTwo.map((event) => event.value)).toEqual([4.5, 3.5, 2.5, 1.5]);

  const sliceThree = await query(cache, (c) => c.sliceSinceUntil(name, since, null, 5));
  expect(sliceThree.map((event) => event.value)).toEqual([5.5, 4.5, 3.5, 2.5, 1.5]);

  const sliceFour = await query(cache, (c) => c.sliceSinceUntil(name, since, null, 4));
  expect(sliceFour.map((event) => event.value)).toEqual([5.5, 4.5, 3.5, 2.5]);

  const [sliceFive, sliceSix] = await mquery(cache, (c) => [
    c.sliceSinceUntil(name, since, until, 4),
    c.sliceSinceUntil(name, since, until, 2, "super tag"),
  ]);
  expect(sliceFive.map((event) => event.value)).toEqual([4.5, 3.5, 2.5, 1.5]);
  expect(sliceSix.map((event) => event.value)).toEqual([3.5, 1.5]);
});

test("value range queries", async () => {
  const name = genName();
  const events = [
    makeEvent(name, new Date(0).toJSON())(0.5),
    makeEvent(name, new Date(1).toJSON())(1.5),
    makeEvent(name, new Date(2).toJSON())(2.5),
    makeEvent(name, new Date(3).toJSON())(2.5),
    makeEvent(name, new Date(4).toJSON())(3.5),
    makeEvent(name, new Date(5).toJSON())(4.5),
    makeEvent(name, new Date(6).toJSON())(5.5),
  ];
  await indexMany(events);

  const since = new Date(1).toJSON();
  const until = new Date(4).toJSON();
  const cache = new ValuesCache(new Date().toJSON(), [], timeseries, conf);

  const sliceOne = await query(cache, (c) => c.slice(name, 3, null, {valueEq: 2.5}));
  expect(sliceOne.map((event) => event.value)).toEqual([2.5, 2.5]);

  const sliceTwo = await query(cache, (c) =>
    c.slice(name, 6, null, {valueLt: 5, valueGte: 1.5})
  );
  expect(sliceTwo.map((event) => event.value)).toEqual([4.5, 3.5, 2.5, 2.5, 1.5]);

  const sliceThree = await query(cache, (c) =>
    c.sliceSinceUntil(name, since, until, 4, null, {valueLte: 2.5, valueGt: 1})
  );
  expect(sliceThree.map((event) => event.value)).toEqual([2.5, 2.5, 1.5]);

  const headOne = await query(cache, (c) => c.head(name, null, {valueLt: 4}));
  expect((headOne || {}).value).toEqual(3.5);

  const cacheWithInitial = new ValuesCache(new Date().toJSON(), events, timeseries, conf);

  const sliceFour = await query(cacheWithInitial, (c) =>
    c.slice(name, 7, null, {valueGt: 0})
  );
  expect(sliceFour.map((event) => event.value)).toEqual(
    events.map((event) => event.value).reverse()
  );
  expect(sliceFour.every((event) => event._cached)).toBeTruthy();
});

test("'earliest' queries", async () => {
  const name = genName();
  const events = [
    makeEvent(name, new Date(0).toJSON())(0.5),
    makeEvent(name, new Date(1).toJSON())(1.5),
    makeEvent(name, new Date(2).toJSON())(2.5),
    makeEvent(name, new Date(3).toJSON())(3.5),
    makeEvent(name, new Date(4).toJSON())(4.5),
    makeEvent(name, new Date(5).toJSON())(5.5),
  ];
  await indexMany(events);

  const since = new Date(2).toJSON();
  const cache = new ValuesCache(new Date().toJSON(), [], timeseries, conf);

  const earliestOne = await cache.getEarliest(name, null, null, 1);
  expect(earliestOne.map((event) => event.value)).toEqual([0.5]);

  const earliestTwo = await cache.getEarliest(name, null, null, 3);
  expect(earliestTwo.map((event) => event.value)).toEqual([0.5, 1.5, 2.5]);

  const earliestThree = await cache.getEarliest(name, since, null, 2);
  expect(earliestThree.map((event) => event.value)).toEqual([2.5, 3.5]);
});

test("identical queries are cached", async () => {
  const name = genName();
  const events = [makeEvent(name, new Date(0).toJSON())(3.1415)];
  await indexMany(events);

  const cache = new ValuesCache(new Date().toJSON(), [], timeseries, conf);

  const receivedOne = await query(cache, (c) => c.head(name));
  expect(receivedOne._cached).toBeFalsy();

  const receivedTwo = await query(cache, (c) => c.head(name));
  expect(receivedTwo._cached).toBeTruthy();
});
