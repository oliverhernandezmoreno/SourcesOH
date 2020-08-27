/* global expect, test */
const distance = require("./distance");

const euclidean = ({coords: {x: x1, y: y1}}, {coords: {x: x2, y: y2}}) =>
  Math.round(Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)));

test("several distance calculations", async () => {
  const pSource = {coords: {x: 305555, y: 6463424, srid: 32719}};

  const pTarget1 = {coords: {x: 305055, y: 6463365, srid: 32719}};
  const distance1A = await distance(pSource, pTarget1);
  const distance1B = await distance(pTarget1, pSource);
  expect(distance1A).toEqual(distance1B);
  expect(distance1A).toEqual(503);
  expect(distance1A).toEqual(euclidean(pSource, pTarget1));

  const pTarget2 = {coords: {x: 303896, y: 6463121, srid: 32719}};
  const distance2A = await distance(pSource, pTarget2);
  const distance2B = await distance(pTarget2, pSource);
  expect(distance2A).toEqual(distance2B);
  expect(distance2A).toEqual(1686);
  expect(distance2A).toEqual(euclidean(pSource, pTarget2));

  const pTarget3 = {coords: {x: 302911, y: 6462191, srid: 32719}};
  const distance3A = await distance(pSource, pTarget3);
  const distance3B = await distance(pTarget3, pSource);
  expect(distance3A).toEqual(distance3B);
  expect(distance3A).toEqual(2917);
  expect(distance3A).toEqual(euclidean(pSource, pTarget3));

  const pTarget4 = {coords: {x: 299310, y: 6462933, srid: 32719}};
  const distance4A = await distance(pSource, pTarget4);
  const distance4B = await distance(pTarget4, pSource);
  expect(distance4A).toEqual(distance4B);
  expect(distance4A).toEqual(6264);
  expect(distance4A).toEqual(euclidean(pSource, pTarget4));
});
