from django.core import management

from api.tests.base import BaseTestCase


class TestDeleteETLOperationsCommand(BaseTestCase):

    def command_doesnt_fail(self):
        management.call_command(
            "deleteetloperations",
            days=60,
            verbosity=0,
        )
        management.call_command(
            "deleteetloperations",
            verbosity=0,
        )
