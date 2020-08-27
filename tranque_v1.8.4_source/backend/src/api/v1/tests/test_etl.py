import datetime
from pathlib import Path
import secrets

from django.core.files.storage import default_storage
from django.urls import reverse
from django.utils import timezone
from django.utils.dateparse import parse_datetime

from api.tests.base import BaseTestCase
from etl.models import ETLOperation, get_executors
from etl.tests.base import ETLBase
from targets import elastic
from targets.models import Timeseries


class ETLTestCase(ETLBase):

    def setUp(self):
        self.as_superuser()
        self.timeseries1 = Timeseries.objects.create(
            canonical_name=f"etl-test-1-{secrets.token_urlsafe(8)}",
            type=Timeseries.TimeseriesType.TEST,
            target=self.target_object,
        )
        self.timeseries2 = Timeseries.objects.create(
            canonical_name=f"etl-test-2-{secrets.token_urlsafe(8)}",
            type=Timeseries.TimeseriesType.TEST,
            target=self.target_object,
        )

    def test_full_etl_sequence_xlsx(self):
        self.full_etl_sequence(self.make_xlsx_file)

    def test_full_etl_sequence_xls(self):
        self.full_etl_sequence(self.make_xls_file)

    def test_full_etl_sequence_csv(self):
        self.full_etl_sequence(self.make_csv_file)

    def full_etl_sequence(self, builder):
        # Build a fake file and attempt to load it in the backend
        sheet = [
            ("2018-01-01T04:10:21Z", self.timeseries1.canonical_name, 1.0),
            ("2018-01-01T04:10:22Z", self.timeseries1.canonical_name, 2.0),
            ("2018-01-01T04:10:23Z", self.timeseries1.canonical_name, 3.0),
            ("2018-01-01T04:10:24Z", self.timeseries1.canonical_name, 4.0),
            ("2018-01-01T04:10:20Z", self.timeseries2.canonical_name, -1.0,
             None, None, None, "", None, None),
            ("2018-01-01T04:10:21Z", self.timeseries2.canonical_name, 0,
             None, None, None, "", None, None),
            ("2018-01-01T04:10:22Z", self.timeseries2.canonical_name, 1000,
             None, 4, None, "This is a row with all nine columns", None, 7),
        ]
        filename = builder(sheet)
        with default_storage.open(filename, "rb") as f:
            datafile_response = self.client_post(
                f"/api/{self.api_version}/data-file/upload-multipart/",
                {"file": f, "filename": Path(filename).name},
                format="multipart",
            )
        self.assertResponseOk(datafile_response)

        # Start an ETL operation with said file
        operation_response = self.client_post(
            f"/api/{self.api_version}/target/{self.target}/etl-operation/",
            {
                "executor": "generic",
                "data_file_id": datafile_response.data["id"],
                "context": {},
            },
        )
        self.assertResponseOk(operation_response)
        self.assertTrue(
            operation_response.data["deliverable"],
            f"errors: {operation_response.data['errors']}",
        )
        self.assertEqual(operation_response.data["data_count"], len(sheet))

        data_response = self.client_get(
            f"/api/{self.api_version}/target/{self.target}"
            f"/etl-operation/{operation_response.data['id']}/data/",
        )
        self.assertResponseOk(data_response)

        # Attempt to deliver the operation
        operation_id = operation_response.data["id"]
        deliver_response = self.client_post(
            f"/api/{self.api_version}/target/{self.target}/etl-operation/{operation_id}/deliver/",
        )
        self.assertResponseOk(deliver_response)

        # Ensure the loaded data matches the original dataset given
        events1 = elastic.scan(self.timeseries1.events_search()[:1000])
        events2 = elastic.scan(self.timeseries2.events_search()[:1000])
        self.assertEqual(
            [
                (parse_datetime(tup[0]).timestamp(),) + tup[1:]
                for tup in reversed(sheet[0:4])
            ],
            [tup[0:3] for tup in map(self.normalize_event, events1)],
        )
        self.assertEqual(
            [
                (parse_datetime(tup[0]).timestamp(),) + tup[1:]
                for tup in reversed(sheet[4:])
            ],
            [self.normalize_event(event) for event in events2],
        )

    def test_no_datafile(self):
        timeseries = Timeseries.objects.create(
            canonical_name=f"etl-test-direct-{secrets.token_urlsafe(8)}",
            type=Timeseries.TimeseriesType.TEST,
            target=self.target_object,
        )
        now = timezone.now()
        events = [
            {
                "name": timeseries.canonical_name,
                "value": index,
                "timestamp": (now - datetime.timedelta(days=index)).isoformat(),
            }
            for index in range(10)
        ]
        operation_response = self.client_post(
            f"/api/{self.api_version}/target/{self.target}/etl-operation/",
            {
                "executor": "direct",
                "context": {"events": events},
            },
        )
        self.assertResponseOk(operation_response)
        self.assertTrue(
            operation_response.data["deliverable"],
            f"errors: {operation_response.data['errors']}",
        )
        self.assertEqual(operation_response.data["data_count"], len(events))
        operation_id = operation_response.data["id"]
        deliver_response = self.client_post(
            f"/api/{self.api_version}/target/{self.target}/etl-operation/{operation_id}/deliver/",
        )
        self.assertResponseOk(deliver_response)
        self.assertEqual(
            [
                (parse_datetime(event["timestamp"]).timestamp(), event["value"])
                for event in events
            ],
            [
                (parse_datetime(event["@timestamp"]).timestamp(), event["value"])
                for event in timeseries.events
            ]
        )

    def test_immediate_deliver(self):
        timeseries = Timeseries.objects.create(
            canonical_name=f"etl-test-immediate-{secrets.token_urlsafe(8)}",
            type=Timeseries.TimeseriesType.TEST,
            target=self.target_object,
        )
        now = timezone.now()
        events = [
            {
                "name": timeseries.canonical_name,
                "value": index,
                "timestamp": (now - datetime.timedelta(days=index)).isoformat(),
            }
            for index in range(10)
        ]
        operation_response = self.client_post(
            f"/api/{self.api_version}/target/{self.target}/etl-operation/deliver/",
            {
                "executor": "direct",
                "context": {"events": events},
            },
        )
        self.assertResponseOk(operation_response)
        self.assertEqual(operation_response.data["state"], "success")
        self.assertEqual(operation_response.data["data_count"], len(events))
        self.assertEqual(
            [
                (parse_datetime(event["timestamp"]).timestamp(), event["value"])
                for event in events
            ],
            [
                (parse_datetime(event["@timestamp"]).timestamp(), event["value"])
                for event in timeseries.events
            ]
        )


class ETLOperationListTestCase(BaseTestCase):

    def setUp(self):
        self.as_superuser()
        self.operations = [
            ETLOperation.objects.create(
                user=self.superuser_object,
                target=self.target_object,
                executor="test.executor.1",
            ),
            ETLOperation.objects.create(
                user=self.superuser_object,
                target=self.target_object,
                executor="test.executor.1",
            ),
            ETLOperation.objects.create(
                user=self.superuser_object,
                target=self.target_object,
                executor="test.executor.2",
            ),
            ETLOperation.objects.create(
                user=self.internal_user_object,
                target=self.target_object,
                executor="test.executor.2",
            ),
            ETLOperation.objects.create(
                user=self.internal_user_object,
                target=self.target_object,
                executor="test.executor.3",
            ),
        ]

    def test_no_filters(self):
        response = self.client_get(
            f"/api/{self.api_version}/target/{self.target}/etl-operation/",
        )
        self.assertResponseOk(response)
        self.assertEqual(len(response.data["results"]), len(self.operations))

    def test_executor_filter(self):
        responseForOne = self.client_get(
            f"/api/{self.api_version}/target/{self.target}/etl-operation/",
            {"executor": "test.executor.2"},
        )
        self.assertResponseOk(responseForOne)
        self.assertEqual(
            len(responseForOne.data["results"]),
            len([
                op for op in self.operations
                if op.executor == "test.executor.2"
            ]),
        )
        responseForTwo = self.client_get(
            f"/api/{self.api_version}/target/{self.target}/etl-operation/",
            {"executor": "test.executor.1,test.executor.2"},
        )
        self.assertResponseOk(responseForTwo)
        self.assertEqual(
            len(responseForTwo.data["results"]),
            len([
                op for op in self.operations
                if op.executor == "test.executor.1"
                or op.executor == "test.executor.2"
            ]),
        )
        responseForZero = self.client_get(
            f"/api/{self.api_version}/target/{self.target}/etl-operation/",
            {"executor": ""},
        )
        self.assertResponseOk(responseForZero)
        # expect the filter to have been ignored
        self.assertEqual(
            len(responseForZero.data["results"]),
            len(self.operations),
        )

    def test_user_filter(self):
        response = self.client_get(
            f"/api/{self.api_version}/target/{self.target}/etl-operation/",
            {"user": self.superuser["username"]},
        )
        self.assertResponseOk(response)
        self.assertEqual(
            len(response.data["results"]),
            len([
                op for op in self.operations
                if op.user.username == self.superuser["username"]
            ]),
        )


class ETLExplainTestCase(BaseTestCase):

    def setUp(self):
        self.as_superuser()
        self.timeseries1 = Timeseries.objects.create(
            canonical_name=f"etl-test-1-{secrets.token_urlsafe(8)}",
            type=Timeseries.TimeseriesType.TEST,
            target=self.target_object,
        )
        self.timeseries2 = Timeseries.objects.create(
            canonical_name=f"etl-test-2-{secrets.token_urlsafe(8)}",
            type=Timeseries.TimeseriesType.TEST,
            target=self.target_object,
        )
        self.timeseries3 = Timeseries.objects.create(
            canonical_name=f"etl-test-3-{secrets.token_urlsafe(8)}",
            type=Timeseries.TimeseriesType.TEST,
            target=self.target_object,
        )
        self.timeseries4 = Timeseries.objects.create(
            canonical_name=f"etl-test-4-{secrets.token_urlsafe(8)}",
            type=Timeseries.TimeseriesType.TEST,
            target=self.target_object,
        )
        self.timeseries3.inputs.set([self.timeseries1, self.timeseries2])
        self.timeseries4.inputs.set([self.timeseries2, self.timeseries3])

    def test_operation_explain(self):
        now = timezone.now()
        events = [
            {
                "name": timeseries.canonical_name,
                "value": 3.1415,
                "timestamp": now.isoformat(),
            }
            for timeseries in [self.timeseries1, self.timeseries2]
        ]
        operation_response = self.client_post(
            f"/api/{self.api_version}/target/{self.target}/etl-operation/deliver/",
            {
                "executor": "direct",
                "context": {"events": events},
            },
        )
        self.assertResponseOk(operation_response)
        operation_id = operation_response.data["id"]
        explain_response = self.client_get(
            f"/api/{self.api_version}/target/{self.target}/etl-operation/{operation_id}/explain/",
        )
        self.assertResponseOk(explain_response)
        self.assertEqual(
            [
                frozenset(t["canonical_name"] for t in ts)
                for ts in explain_response.data["plan"]
            ],
            [
                frozenset([self.timeseries1.canonical_name, self.timeseries2.canonical_name]),
                frozenset([self.timeseries3.canonical_name]),
                frozenset([self.timeseries4.canonical_name]),
            ],
        )
        self.assertEqual(
            frozenset(f["name"] for f in explain_response.data["facts"]),
            # there is no enrichment here, so nothing will be computed
            frozenset([self.timeseries1.canonical_name, self.timeseries2.canonical_name]),
        )


class ExecutorDescriptorTestCase(BaseTestCase):

    def setUp(self):
        self.as_mine()

    def test_list_executors(self):
        url = reverse(f"{self.api_version}:executor-list", args=[self.target])
        self.assertResponseOk(self.client_get(url))

    def test_retrieve_executor(self):
        name = list(get_executors())[0].executor
        url = reverse(f"{self.api_version}:executor-detail", args=[self.target, name])
        self.assertResponseOk(self.client_get(url))

    def test_list_groups(self):
        name = list(get_executors())[0].executor
        url = reverse(f"{self.api_version}:executor-group", args=[self.target, name])
        self.assertResponseOk(self.client_get(url))

    def test_list_sources(self):
        name = list(get_executors())[0].executor
        url = reverse(f"{self.api_version}:executor-source", args=[self.target, name])
        self.assertResponseOk(self.client_get(url))

    def test_list_series(self):
        name = list(get_executors())[0].executor
        url = reverse(f"{self.api_version}:executor-series", args=[self.target, name])
        self.assertResponseOk(self.client_get(url))

    def test_list_parameters(self):
        name = list(get_executors())[0].executor
        url = reverse(f"{self.api_version}:executor-parameter", args=[self.target, name])
        self.assertResponseOk(self.client_get(url))
