// A backend facade used for tests.
module.exports.mockedBackend = (data) => {
  const timeseries = (data || {}).timeseries || {};
  const plans = (data || {}).plans || {};

  return {
    existingTimeseries: async (names) =>
      new Set(Array.from(names).filter((name) => typeof plans[name] !== "undefined")),

    plans: async (names) =>
      names.map((name) => plans[name]).filter((plan) => typeof plan !== "undefined"),

    timeseries: async (names) =>
      names.map((name) => timeseries[name]).filter((ts) => typeof ts !== "undefined"),
  };
};
