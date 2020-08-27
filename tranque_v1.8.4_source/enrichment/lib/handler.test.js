/* global expect, test */
const handler = require("./handler");

test("dispatches a valid message", async () => {
  await handler.dispatch('{"events": [{"name":"foo","value":1,"@timestamp":"2018"}]}');
});

test("doesn't dispatch an invalid message", async () => {
  let passed = true;
  try {
    await handler.dispatch('{"events');
  } catch (_) {
    passed = false;
  }
  expect(passed).toBe(false);
});

test("doesn't dispatch an empty message", async () => {
  let passed = true;
  try {
    await handler.dispatch("{}");
  } catch (_) {
    passed = false;
  }
  expect(passed).toBe(false);
});
