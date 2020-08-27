from pathlib import Path
import secrets

from etl.models import ETLOperation
from etl.tests.base import ETLBase
from targets.models import Timeseries, DataSource, DataSourceGroup


class EMACREV0ETLTestCase(ETLBase):

    variables = [
        "pH",
        "CE",
        "Al",
        "As",
        "B",
        "Pb",
    ]

    extra_variables = [
        ("Ca", "emac-mvp.ionic-balance.ca"),
        ("K", "emac-mvp.ionic-balance.k"),
        ("Mg", "emac-mvp.ionic-balance.mg"),
        ("Na", "emac-mvp.ionic-balance.na"),
        ("Cl", "emac-mvp.variables.chloride"),
        ("HCO3", "emac-mvp.ionic-balance.bicarbonates"),
        ("CO3", "emac-mvp.ionic-balance.carbonates"),
        ("SO4", "emac-mvp.variables.sulfates"),
    ]

    def setUp(self):
        self.datasourcegroup = DataSourceGroup.objects.create(
            name="ETL Test",
            canonical_name=f"etl-test-{secrets.token_urlsafe(8)}",
            target=self.target_object,
        )
        self.datasource1 = DataSource.objects.create(
            hardware_id=f"etl-test-emac-rev0-1-{secrets.token_urlsafe(8)}",
            name="ETL Test 1",
            canonical_name=f"etl-test-1-{secrets.token_urlsafe(8)}",
            target=self.target_object,
        )
        self.datasource1.groups.add(self.datasourcegroup)
        self.timeseries = []
        for index, variable in enumerate(self.variables):
            self.timeseries.append(Timeseries.objects.create(
                name=f"{variable} -- Foo bar baz",  # names might be 'enriched' with suffixes
                canonical_name=f"etl-test-variable-{index}-1-{secrets.token_urlsafe(8)}",
                template_name="emac-mvp.variables.foo",
                data_source=self.datasource1,
                target=self.target_object,
            ))
        self.timeseries_extra = []
        for index, (variable, template_name) in enumerate(self.extra_variables):
            self.timeseries_extra.append(Timeseries.objects.create(
                name=f"{variable} -- Foo bar baz",
                canonical_name=f"etl-test-extra-variable-{index}-1-{secrets.token_urlsafe(8)}",
                template_name=template_name,
                data_source=self.datasource1,
                target=self.target_object,
            ))

    def test_emac_rev0(self):
        datafile = self.make_copied_datafile(Path(__file__).parent / "test_emac_rev0.xlsx")
        operation = ETLOperation.start(
            "emac_rev0",
            datafile.uploaded_by,
            self.target_object,
            datafile,
            {"group": self.datasourcegroup.canonical_name},
        )
        assert not operation.finished, f"Operation finished before delivery: {operation.errors}"
        operation.deliver()
        self.assertEqual(operation.state, ETLOperation.ETLState.SUCCESS)
        for index, ts in enumerate(self.timeseries):
            events_value = [event["value"] for event in ts.events]
            validate = [(index * 20 + x) for x in range(5)]
            self.assertEqual(events_value, validate)

    def test_failure_by_mismatch(self):
        datafile = self.make_copied_datafile(Path(__file__).parent / "test_emac_rev0_mismatch.xlsx")
        operation = ETLOperation.start(
            "emac_rev0",
            datafile.uploaded_by,
            self.target_object,
            datafile,
            {"group": self.datasourcegroup.canonical_name, "timezoneOffset": 180},
        )
        assert operation.finished, "operation didn't finish"
        self.assertEqual(operation.errors, [
            {
                "sheet_number": 3,
                "sheet_name": "DATOS ",
                "linenumber": 11,
                "code": "value-mismatch",
                "message": "The row contains mismatched values",
                "source": "ETL Test 1",
                "series": "Cl",
            }
        ])

    def test_failure_by_ionic_balance(self):
        datafile = self.make_copied_datafile(Path(__file__).parent / "test_emac_rev0_ionicbalance.xlsx")
        operation = ETLOperation.start(
            "emac_rev0",
            datafile.uploaded_by,
            self.target_object,
            datafile,
            {"group": self.datasourcegroup.canonical_name},
        )
        assert operation.finished, "operation didn't finish"
        assert operation.errors
        self.assertEqual(operation.errors[0]["code"], "invalid-ionic-balance")
        self.assertTrue(operation.errors[0]["ionicBalance"] > 10)
