/* global expect, test */
const conf = require("./conf");

test("configuration variables are read from the environment", () => {
  expect(conf.NODE_ENV).toBe("test");
});

test("git commit is read from the git directory", () => {
  expect(conf.COMMIT).not.toBeNull();
});
