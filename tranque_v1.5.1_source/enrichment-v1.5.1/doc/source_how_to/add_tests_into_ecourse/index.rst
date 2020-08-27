Add tests into Ecourse
======================

In this page we can learn how to test the ecourse functions

Create a test file with the tests
#################################

Create the tranque/ecourse/src/ecourse-mvp/escuela/escuela.test.js:

.. code-block:: javascript

    const ctxRootRefMock = "this-script";

    const utilsIsDefinedMock = (x) => typeof x !== "undefined";

    const seriesQueryMock = async ({head: name}) => ({
      [ctxRootRefMock]: {value: 7},
    })[name];

    test("script computes nota de la escuela", async () => {
      const seriesQueryAllMock = async () => [
        {value: 4.0},
        {value: 4.4},
        {value: 6.5},
        {value: 6.2},
        {value: 6.5},
        {value: 6.7},
        {value: 6.3},
        {value: 6.4},
      ];
      const seriesSaveMock = jest.fn();
      await script({
        ctx: {rootRef: ctxRootRefMock},
        series: {
          queryAll: seriesQueryAllMock,
          query: seriesQueryMock,
          save: seriesSaveMock,
        },
        utils: {isDefined: utilsIsDefinedMock},
      });
      // assert
      expect(seriesSaveMock.mock.calls.length)
        .toEqual(1);
      expect(seriesSaveMock.mock.calls[0][0])
        .toEqual((4.0+4.4+6.5+6.2+6.5+6.7+6.3+6.4)/8);
    });

Now, we can run the test bash script:

.. code-block:: bash

    $ ./test.sh

    PASS ../../../tmp/tmp.sYhcQK6mZs/src/ecourse-mvp/escuela/escuela.test.js
      ✓ script computes nota de la escuela (4ms)

    Test Suites: 1 passed, 1 total
    Tests:       1 passed, 1 total
    Snapshots:   0 total
    Time:        0.989s
    Ran all test suites.
