from django.core import management

from api.tests.base import BaseTestCase


class TestAlertsEngineCommand(BaseTestCase):

    def test_all_targets(self):
        management.call_command("alertsengine", all_targets=True)

    def test_specific_targets(self):
        management.call_command("alertsengine", self.target)

    def test_hints(self):
        management.call_command("alertsengine", hints="foo,bar")
