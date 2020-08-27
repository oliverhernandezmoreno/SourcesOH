describe("mean", () => {
  test("computes the arithmetic mean correctly", async () => {
    const {mean} = await script({});

    expect(mean([1, 2, 3], (x) => x)).toEqual(2);
    expect(mean([7], (x) => x)).toEqual(7);
    expect(mean([{value: 1}, {value: 10}])).toEqual(5.5);
  });

  test("fails on empty data vectors", async () => {
    const {mean} = await script({});

    expect(() => mean([])).toThrow();
  });
});

describe("variance", () => {
  test("computes the variance correctly", async () => {
    const {variance} = await script({});

    expect(variance([1, 2, 3], (x) => x)).toEqual(1);
    expect(variance([7, 11], (x) => x)).toEqual(8);
    expect(variance([{value: 1}, {value: 10}, {value: 13}])).toEqual(39);
  });

  test("fails on insufficiently big data sets", async () => {
    const {variance} = await script({});

    expect(() => variance([{value: 1}])).toThrow();
    expect(() => variance([])).toThrow();
  });
});

describe("standardDeviation", () => {
  test("computes the variance correctly", async () => {
    const {standardDeviation} = await script({});

    expect(standardDeviation([1, 2, 3], (x) => x)).toEqual(1);
    expect(standardDeviation([7, 11], (x) => x)).toBeCloseTo(2.8, 1);
    expect(standardDeviation([{value: 1}, {value: 10}, {value: 13}])).toBeCloseTo(6.2, 1);
  });

  test("fails on insufficiently big data sets", async () => {
    const {standardDeviation} = await script({});

    expect(() => standardDeviation([{value: 1}])).toThrow();
    expect(() => standardDeviation([])).toThrow();
  });
});
