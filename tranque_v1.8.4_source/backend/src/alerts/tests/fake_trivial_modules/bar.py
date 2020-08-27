from django.db.models import Q
from django.utils.decorators import classproperty

from alerts.modules.base import spread
from alerts.tests.fake_trivial_modules.base import BaseTestController
from targets.models import DataSourceGroup


@spread(DataSourceGroup, Q(canonical_name__startswith="test-group-"))
class Controller(BaseTestController):
    children = ()

    @classproperty
    def relevant_events(cls):
        return [BaseTestController.event_query(
            Q(template_name='bar-test') &
            Q(data_source_group=cls.spread_object()),
            5
        )]

    visibility_groups = ("foobar",)

    def should_propagate(self, ticket):
        return True
