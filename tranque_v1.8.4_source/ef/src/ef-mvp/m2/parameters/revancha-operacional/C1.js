const revancha = await series.query({head: "*"});
const ref = await refs.getOne("*");

const threshold = ref.active_thresholds
      .filter(({kind, upper}) => kind === null && upper !== null)
      .map(({upper}) => parseFloat(upper))[0];

if (utils.isDefined(threshold)) {
  series.yield(~~(revancha.value >= threshold), {meta: {
    revancha: revancha.value,
    threshold
  }});
}
