from django.contrib.auth.models import Group
from django.core.management import call_command
from guardian.shortcuts import get_perms

from api.tests.base import BaseTestCase
from targets.models import Target


class TestProfileForest(BaseTestCase):

    def call_command(self, dry=''):
        call_command(
            "createtargetgroups",
            self.target,
            dry=dry,
            verbosity=0,
        )

    def setUp(self):
        Group.objects.all().delete()

    def test_command(self):
        self.call_command()
        new_groups = [
            'ticket.emac.miner-1',
            'ticket.emac.miner-2',
            'ticket.emac.miner-3',
            'ticket.emac.miner-4',
            'ticket.emac.authority-1',
            'ticket.emac.authority-2',
            'ticket.emac.authority-3',
            'ticket.ef.miner-1',
            'ticket.ef.miner-2',
            'ticket.ef.miner-3',
            'ticket.ef.miner-4',
            'ticket.ef.authority-1',
            'ticket.ef.authority-2',
            'ticket.ef.authority-3',
            'forms.miner.editor',
            'forms.miner.validator',
            'forms.miner.sender',
            'forms.authority',
        ]
        self.assertEqual(Group.objects.count(), len(new_groups))
        self.assertSetEqual(
            set(g.name for g in Group.objects.all()),
            {f'{self.target}.{code}' for code in new_groups}
        )
        target = self.target_object
        target2 = Target.objects.exclude(canonical_name=target.canonical_name).first()
        for g in Group.objects.all():
            self.assertTrue(get_perms(g, target))
            self.assertFalse(get_perms(g, target2))

    def test_dry_command(self):
        self.call_command(dry='True')
        self.assertEqual(Group.objects.count(), 0)
