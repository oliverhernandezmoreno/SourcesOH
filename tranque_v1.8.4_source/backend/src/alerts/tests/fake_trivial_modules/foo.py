from django.db.models import Q

from alerts.tests.fake_trivial_modules.base import BaseTestController


class Controller(BaseTestController):
    children = ("*.bar", "*.baz",)

    relevant_events = [
        BaseTestController.event_query(Q(canonical_name__startswith="foo-test-"), 3),
    ]

    visibility_groups = ("foobar",)
