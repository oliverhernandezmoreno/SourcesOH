describe("pointInCurve", () => {
  test("handles trivial cases", async () => {
    const {pointInCurve} = await script({});

    expect(pointInCurve([[0, 1]], 0)).toEqual(1);
    expect(pointInCurve([[0, 1]], -1000)).toEqual(1);
    expect(pointInCurve([[0, 1]], +1000)).toEqual(1);

    expect(pointInCurve([[0, 1], [1, 2]], 0)).toEqual(1);
    expect(pointInCurve([[0, 1], [1, 2]], 1)).toEqual(2);
    expect(pointInCurve([[0, 1], [1, 2]], -1000)).toEqual(1);
    expect(pointInCurve([[0, 1], [1, 2]], +1000)).toEqual(2);
    expect(pointInCurve([[0, 1], [1, 2]], 0.5)).toEqual(1.5);
  });

  test("selects the proper segment", async () => {
    const {pointInCurve} = await script({});
    const points = [
      [0, 1],
      [1, 2],
      [-1, 5],
    ];

    expect(pointInCurve(points, 0.5)).toEqual(1.5);
    expect(pointInCurve(points, -0.25)).toEqual(2);
    expect(pointInCurve(points, +1000)).toEqual(2);
    expect(pointInCurve(points, -1000)).toEqual(5);
  });

  test("deduplicates selecting the first tuple", async () => {
    const {pointInCurve} = await script({});
    const points = [
      [0, 1],
      [1, 2],
      [0, 0],
      [0, -1],
    ];

    expect(pointInCurve(points, 0.5)).toEqual(1.5);
  });

  test("applies advanced options", async () => {
    const {pointInCurve} = await script({});
    const points = [1, 2, 3];

    expect(pointInCurve(points, 1.5, ((x) => [x, x * x]))).toEqual(2.5);

    const things = [{x: 2, y: 3}, {x: 2, y: 4}];
    expect(pointInCurve(
      things,
      2,
      ((t) => [t.x, t.y])
    )).toEqual(3);
    expect(pointInCurve(
      things,
      2,
      ((t) => [t.x, t.y]),
      ((ts) => ts[ts.length - 1])
    )).toEqual(4);
  });
});
