
const utilsIsDefinedMock = (x) => typeof x !== "undefined";
const name = "testname"

test("script return 0 when value is not upper the threshold", async () => {
  const until = {value: 10, "@timestamp": "2018-01-28T00:00:00+00:00"};
  const value = {value: 1535140800, meta: {until}};

  const threshold = {
    canonical_name: name,
    active_thresholds: [
      {
        upper: 21,
      },
    ],
  };

  const seriesSaveMock = jest.fn();
  const seriesQueryMock = async () => value;
  const refsGetOneMock = async () => threshold;
  const daysAgo = async () => "2017-12-23T00:00:00+00:00";
  const unixTimestampToDate = async () => "2017-12-23T00:00:00+00:00";
  const isAfter = async () => false;
  const debug = (msg) => console.log("DEBUG:", msg);

  await script({
    refs: {
      getOne: refsGetOneMock,
    },
    series: {
      query: seriesQueryMock,
      yield: seriesSaveMock,
    },
    utils: {
      isDefined: utilsIsDefinedMock,
      debug: debug,
      daysAgo: daysAgo,
      unixTimestampToDate: unixTimestampToDate,
      isAfter: isAfter,
    },
  });

  // assert
  expect(seriesSaveMock.mock.calls.length)
    .toEqual(1);
  expect(seriesSaveMock.mock.calls[0][0])
    .toEqual(0);

});


// test("script return 1 when value is upper the threshold", async () => {
//   const until = {value: 56, "@timestamp": "2018-03-25T00:00:00+00:00"};
//   const value = {value: 1520599425.4144, meta: {until}};
//   console.log('value', value);
//
//   const threshold = {
//     canonical_name: name,
//     active_thresholds: [
//       {
//         upper: 21,
//       },
//     ],
//   };
//
//   const seriesSaveMock = jest.fn();
//   const seriesQueryMock = async () => value;
//   const refsGetOneMock = async () => threshold;
//   const daysAgo = async () => "2018-02-17T00:00:00";
//   const unixTimestampToDate = async () => "2018-02-17T00:00:00";
//   const isAfter = async () => true;
//   const debug = (msg) => console.log("DEBUG:", msg);
//
//   await script({
//     refs: {
//       getOne: refsGetOneMock,
//     },
//     series: {
//       query: seriesQueryMock,
//       yield: seriesSaveMock,
//     },
//     utils: {
//       isDefined: utilsIsDefinedMock,
//       debug: debug,
//       daysAgo: daysAgo,
//       unixTimestampToDate: unixTimestampToDate,
//       isAfter: isAfter,
//     },
//   });
//
//   console.log('return 1 value', seriesSaveMock.mock.calls[0][0]);
//   console.log('meta', seriesSaveMock.mock.calls[0][1]);
//
//   // assert
//   expect(seriesSaveMock.mock.calls.length)
//     .toEqual(1);
//   expect(seriesSaveMock.mock.calls[0][0])
//     .toEqual(1);
//
// });
