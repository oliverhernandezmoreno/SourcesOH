const B1 = await series.query({head: "*.B1"});
const B2 = await series.query({head: "*.B2"});

series.yield(
  utils.isDefined(B1) && B1.value > 0 && utils.isDefined(B2) && B2.value > 0,
  {meta: {B1, B2}},
);
