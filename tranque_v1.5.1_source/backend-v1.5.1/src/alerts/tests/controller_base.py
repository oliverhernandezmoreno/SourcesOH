import os
import secrets
import tempfile
from pathlib import Path

from django.conf import settings
from django.core.files import File

from alerts.models import Ticket, UserIntent
from api.tests.base import BaseTestCase
from documents.models import Document
from targets.elastic import Search
from targets.elastic.conn import delete
from targets.models import DataSourceGroup, Timeseries


class ControllerBaseTestCase(BaseTestCase):

    def setUp(self):
        self.g1 = DataSourceGroup.objects.create(
            target=self.target_object,
            name=f"test-group-1-{secrets.token_urlsafe(4)}",
        )
        self.g2 = DataSourceGroup.objects.create(
            target=self.target_object,
            name=f"test-group-2-{secrets.token_urlsafe(4)}",
        )

    def random_document(self):
        fd, name = tempfile.mkstemp(dir=settings.MEDIA_ROOT)
        self.files = [*getattr(self, "files", ()), name]
        os.close(fd)
        with open(name, "rb") as f:
            return Document.objects.create(
                folder="random",
                file=File(f),
                name=f"random-{secrets.token_urlsafe(8)}",
            )

    def setup_timeseries(self, **props):
        events = props.pop("events", [])
        all_events = props.pop("all_events", events)
        timeseries = Timeseries.objects.create(**{
            "canonical_name": f"test-{secrets.token_urlsafe(8)}",
            **props,
            "target": self.target_object,
        })
        timeseries._events = events
        timeseries._all_events = all_events
        return timeseries

    def setup_authority_intent(self, state, document=False):
        return UserIntent.objects.create(
            target=self.target_object,
            module=f"test-{secrets.token_urlsafe(8)}",
            user=self.authority_user_object,
            content={
                "state": state,
                **({"document": self.random_document()} if document else {}),
            },
        )

    def setup_mine_intent(self, state, document=False):
        return UserIntent.objects.create(
            target=self.target_object,
            module=f"test-{secrets.token_urlsafe(8)}",
            user=self.mine_user_object,
            content={
                "state": state,
                **({"document": self.random_document().id} if document else {}),
            },
        )

    def setup_ticket(self, state, module=None):
        return Ticket.objects.create(
            module=(
                module
                if module is not None
                else f"random-{secrets.token_urlsafe(8)}"
            ),
            state=state,
            target=self.target_object,
        )

    def delete_events(self, ids):
        delete(Search().filter_by_id(ids), refresh="true")

    def tearDown(self):
        super().tearDown()
        for p in getattr(self, "files", ()):
            Path(p).unlink()
