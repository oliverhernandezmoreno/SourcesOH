from django.core import management

from api.tests.base import BaseTestCase
from targets.models import Timeseries, Target


class TestApplyTargetProfileCommand(BaseTestCase):

    profile = "fake/singleton"
    template = "fake.singleton"

    def test_applytargetprofile_command(self):
        target = Target.objects.exclude(canonical_name=self.target).first()
        # The target is not intervened
        self.assertTrue(not Timeseries.objects.filter(
            target=target,
            template_name=self.template,
        ).exists())
        management.call_command(
            "applytargetprofile",
            target.canonical_name,
            self.profile,
            verbosity=0,
        )
        # The target was intervened
        self.assertTrue(Timeseries.objects.filter(
            target=target,
            template_name=self.template,
        ).exists())
