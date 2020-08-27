const utilsIsDefinedMock = (x) => typeof x !== "undefined";

const VERTEDERO_NO_OPERATIVO_YES = + true;  // 1
const VERTEDERO_NO_OPERATIVO_NO  = + false; // 0

test("script return true when " +
  "Evento A1: "+
  "Se activa el evento gatillador asociado a que el vertedero de emergencia no está operativo.", async () => {
  const expected = Boolean(VERTEDERO_NO_OPERATIVO_YES);
  const last = {value: VERTEDERO_NO_OPERATIVO_YES};

  const seriesSaveMock = jest.fn();
  const seriesQueryMock = async () => last;

  const debug = (msg) => console.log("DEBUG:", msg);

  await script({
    series: {
      query: seriesQueryMock,
      yield: seriesSaveMock,
    },
    utils: {
      isDefined: utilsIsDefinedMock,
      debug: debug,
    },
  });

  // assert
  expect(seriesSaveMock.mock.calls.length)
    .toEqual(1);
  expect(seriesSaveMock.mock.calls[0][0])
    .toEqual(expected);
});

test("script return false when " +
  "Evento A1: "+
  "Se activa el evento gatillador asociado a que el vertedero de emergencia no está operativo.", async () => {
  const expected = Boolean(VERTEDERO_NO_OPERATIVO_NO);
  const last = {value: VERTEDERO_NO_OPERATIVO_NO};

  const seriesSaveMock = jest.fn();
  const seriesQueryMock = async () => last;

  const debug = (msg) => console.log("DEBUG:", msg);

  await script({
    series: {
      query: seriesQueryMock,
      yield: seriesSaveMock,
    },
    utils: {
      isDefined: utilsIsDefinedMock,
      debug: debug,
    },
  });

  // assert
  expect(seriesSaveMock.mock.calls.length)
    .toEqual(1);
  expect(seriesSaveMock.mock.calls[0][0])
    .toEqual(expected);
});
