from pathlib import Path
import secrets

from etl.models import ETLOperation
from etl.tests.base import ETLBase
from targets.models import Timeseries, DataSource, DataSourceGroup


class EMACREV1ETLTestCase(ETLBase):

    variables = [
        ("pH", "emac-mvp.variables.ph"),
        ("CE", "emac-mvp.variables.ce"),
        ("Al", "emac-mvp.variables.al"),
        ("As", "emac-mvp.variables.as"),
        ("B", "emac-mvp.variables.b"),
        ("Pb", "emac-mvp.variables.pb"),
        ("SO4", "emac-mvp.variables.sulfates"),
        ("CO3", "emac-mvp.ionic-balance.carbonates"),
        ("Mg", "emac-mvp.ionic-balance.mg"),
    ]

    values = [
        7.61, 437.0, 0.06, 0.001, 0.01, 0.01, 58.0, 0.2, 15.0,
        6.87, 569.0, 0.05, 0.001, 0.01, 0.01, 54.0, 0.2, 15.0,
    ]

    def setUp(self):
        self.datasourcegroup = DataSourceGroup.objects.create(
            name="ETL Test",
            canonical_name=f"etl-test-{secrets.token_urlsafe(8)}",
            target=self.target_object,
        )
        self.datasource1 = DataSource.objects.create(
            hardware_id=f"etl-test-emac-rev1-1-{secrets.token_urlsafe(8)}",
            name="ETL Test 1",
            canonical_name=f"etl-test-1-{secrets.token_urlsafe(8)}",
            target=self.target_object,
        )
        self.datasource1.groups.add(self.datasourcegroup)
        self.datasource2 = DataSource.objects.create(
            hardware_id=f"etl-test-emac-rev1-2-{secrets.token_urlsafe(8)}",
            name="ETL Test 2",
            canonical_name=f"etl-test-2-{secrets.token_urlsafe(8)}",
            target=self.target_object,
        )
        self.datasource2.groups.add(self.datasourcegroup)
        self.timeseries = []
        for index, (variable, template_name) in enumerate(self.variables):
            self.timeseries.append(Timeseries.objects.create(
                name=f"{variable} -- Foo bar baz",  # names might be 'enriched' with suffixes
                canonical_name=f"etl-test-variable-{index}-1-{secrets.token_urlsafe(8)}",
                template_name=template_name,
                data_source=self.datasource1,
                target=self.target_object,
            ))
        for index, (variable, template_name) in enumerate(self.variables):
            self.timeseries.append(Timeseries.objects.create(
                name=f"{variable} -- Foo bar baz",
                canonical_name=f"etl-test-variable-{index}-2-{secrets.token_urlsafe(8)}",
                template_name=template_name,
                data_source=self.datasource2,
                target=self.target_object,
            ))

    def test_emac_rev1(self):
        datafile = self.make_copied_datafile(Path(__file__).parent / "test_emac_rev1.xlsx")
        operation = ETLOperation.start(
            "emac_rev1",
            datafile.uploaded_by,
            self.target_object,
            datafile,
            {"group": self.datasourcegroup.canonical_name},
        )
        assert operation.deliverable, \
            f"Operation is not deliverable: {operation.conformed_values.count()} values {operation.errors}"
        operation.deliver()
        self.assertEqual(operation.state, ETLOperation.ETLState.SUCCESS)
        delivered = [
            event["value"]
            for ts in self.timeseries
            for event in ts.events[0:1]
        ]
        self.assertEqual(delivered, self.values)
