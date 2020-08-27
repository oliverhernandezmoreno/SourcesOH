from pathlib import Path
import secrets

from etl.models import ETLOperation
from etl.tests.base import ETLBase
from targets.models import Timeseries, DataSource, DataSourceGroup


class SMAV12019ETLTestCase(ETLBase):

    variables = [
        "Temperatura",
        "pH",
        "CE",
        "Al",
        "As",
        "N-NO3",
    ]

    def setUp(self):
        self.datasourcegroup = DataSourceGroup.objects.create(
            name="ETL Test",
            canonical_name=f"etl-test-{secrets.token_urlsafe(8)}",
            target=self.target_object,
        )
        self.datasource1 = DataSource.objects.create(
            hardware_id=f"etl-test-sma_v1_2019-1-{secrets.token_urlsafe(8)}",
            name="ETL Test 1",
            canonical_name=f"etl-test-1-{secrets.token_urlsafe(8)}",
            target=self.target_object,
        )
        self.datasource1.groups.add(self.datasourcegroup)
        self.datasource2 = DataSource.objects.create(
            hardware_id=f"etl-test-sma_v1_2019-2-{secrets.token_urlsafe(8)}",
            name="ETL Test 2",
            canonical_name=f"etl-test-2-{secrets.token_urlsafe(8)}",
            target=self.target_object,
        )
        self.datasource2.groups.add(self.datasourcegroup)
        self.timeseries = []
        for index, variable in enumerate(self.variables):
            self.timeseries.append(Timeseries.objects.create(
                name=f"{variable} -- Foo bar baz",  # names might be 'enriched' with suffixes
                canonical_name=f"etl-test-variable-{index}-1-{secrets.token_urlsafe(8)}",
                template_name="emac-mvp.variables.foo",
                data_source=self.datasource1,
                target=self.target_object,
            ))
            self.timeseries.append(Timeseries.objects.create(
                name=f"{variable} -- Omg omg omg",
                canonical_name=f"etl-test-variable-{index}-2-{secrets.token_urlsafe(8)}",
                template_name="emac-mvp.variables.bar",
                data_source=self.datasource2,
                target=self.target_object,
            ))

    def test_sma_v1_2019(self):
        datafile = self.make_copied_datafile(Path(__file__).parent / "test_sma_v1_2019.xlsx")
        operation = ETLOperation.start(
            "sma_v1_2019",
            datafile.uploaded_by,
            self.target_object,
            datafile,
            {"group": self.datasourcegroup.canonical_name},
        )
        assert not operation.finished, f"Operation finished before delivery: {operation.errors}"
        operation.deliver()
        self.assertEqual(operation.state, ETLOperation.ETLState.SUCCESS)
        for index, ts in enumerate(self.timeseries):
            self.assertEqual(
                [event["value"] for event in ts.events],
                [(index * 10 + x) for x in range(5)],
            )
