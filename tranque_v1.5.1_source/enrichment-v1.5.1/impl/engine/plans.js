// Deduplication with identity (===) comparison, keeping the *last*
// element found in the collection.
const dedup = (collection) =>
  collection.filter(
    (element, index) => collection.slice(index + 1).indexOf(element) === -1
  );

// Merge execution plans so that the resulting plan is a logically
// sorted order of execution for all the relevant timeseries
const mergePlans = (plans) => plans.reduce((p1, p2) => dedup([...p1, ...p2]), []);

module.exports.mergePlans = mergePlans;
