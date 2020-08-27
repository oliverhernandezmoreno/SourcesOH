from itertools import zip_longest
import secrets

from django.utils.dateparse import parse_datetime

from etl.models import ETLOperation
from etl.tests.base import ETLBase
from targets.models import Timeseries, DataSource, DataSourceGroup


class SingleFromContextETLTestCase(ETLBase):

    data_sheet = [
        ("2018-01-01T12:01:01Z", 1.0),
        ("2018-01-01T12:01:02Z", 2.0),
        ("2018-01-01T12:01:03Z", 3.0, 101),
        ("2018-01-01T12:01:04Z", 4.0, None, 202),
        ("2018-01-01T12:01:05Z", 5.0, 1, 2, 3),
        ("2018-01-01T12:01:06Z", 6.0, None, None, 303, "foo"),
        ("2018-01-01T12:01:07Z", 7.0, None, None, None, "bar"),
    ]

    def setUp(self):
        from targets.profiling import FOREST
        template_spread = next(
            t.value.canonical_name
            for t in FOREST.values()
            if t.value.scope == "spread"
        )
        self.datasource = DataSource.objects.create(
            hardware_id=f"etl-test-single_from_context-{secrets.token_urlsafe(8)}",
            name="ETL Test",
            canonical_name="etl-test-{secrets.token_urlsafe(8)}",
            target=self.target_object,
        )
        self.timeseries_spread = Timeseries.objects.create(
            canonical_name=f"etl-test-single_from_context-spread-{secrets.token_urlsafe(8)}",
            template_name=template_spread,
            type=Timeseries.TimeseriesType.TEST,
            target=self.target_object,
            data_source=self.datasource,
        )
        self.spread_context = {
            "template": template_spread,
            "source": self.datasource.hardware_id,
        }
        template_group = next(
            t.value.canonical_name
            for t in FOREST.values()
            if t.value.scope == "group"
        )
        self.datasourcegroup = DataSourceGroup.objects.create(
            name="ETL Test",
            canonical_name="etl-test-{secrets.token_urlsafe(8)}",
            target=self.target_object,
        )
        self.timeseries_group = Timeseries.objects.create(
            canonical_name=f"etl-test-single_from_context-group-{secrets.token_urlsafe(8)}",
            template_name=template_group,
            type=Timeseries.TimeseriesType.TEST,
            target=self.target_object,
            data_source_group=self.datasourcegroup,
        )
        self.group_context = {
            "template": template_group,
            "group": self.datasourcegroup.canonical_name,
        }
        template_global = next(
            t.value.canonical_name
            for t in FOREST.values()
            if t.value.scope is None
        )
        self.timeseries_global = Timeseries.objects.create(
            canonical_name=f"etl-test-single_from_context-global-{secrets.token_urlsafe(8)}",
            template_name=template_global,
            type=Timeseries.TimeseriesType.TEST,
            target=self.target_object,
        )
        self.global_context = {
            "template": template_global,
        }

    def normalize_sheet_row(self, ts, row):
        return tuple([
            parse_datetime(row[0]).timestamp(),
            ts.canonical_name,
            *(
                cell or placeholder
                for cell, placeholder in zip_longest(row[1:], (None, None, None, None, "", None, None))
            ),
        ])

    def etl_sequence(self, builder, sheet, timeseries, context):
        datafile = builder(sheet)
        operation = ETLOperation.start(
            "single_from_context",
            datafile.uploaded_by,
            self.target_object,
            datafile,
            context,
        )
        assert not operation.finished, f"Operation finished before delivery: {operation.errors}"
        operation.deliver()
        self.assertEqual(operation.state, ETLOperation.ETLState.SUCCESS)
        self.assertEqual(
            [
                self.normalize_event(event)
                for event in timeseries.get_events(0, 10, desc=False)
            ],
            [
                self.normalize_sheet_row(timeseries, row)
                for row in sheet
            ],
        )

    def test_xlsx_global(self):
        self.etl_sequence(
            self.make_xlsx_datafile,
            self.data_sheet,
            self.timeseries_global,
            self.global_context,
        )

    def test_xls_group(self):
        self.etl_sequence(
            self.make_xls_datafile,
            self.data_sheet,
            self.timeseries_group,
            self.group_context,
        )

    def test_csv_spread(self):
        self.etl_sequence(
            self.make_csv_datafile,
            self.data_sheet,
            self.timeseries_spread,
            self.spread_context,
        )
