from django.db.models import Q

from alerts.tests.fake_trivial_modules.base import BaseTestController


class Controller(BaseTestController):
    children = ()

    visibility_groups = ("foobar",)

    relevant_events = [
        BaseTestController.event_query(Q(canonical_name__startswith="baz-test-"), 1),
    ]
