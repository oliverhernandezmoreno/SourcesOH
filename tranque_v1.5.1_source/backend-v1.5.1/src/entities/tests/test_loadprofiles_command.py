import os
from pathlib import Path
import secrets
import tempfile

from django.core import management

from api.tests.base import BaseTestCase
from entities.models import UserProfile
from targets.models import Target

TEST_FILE = """
- username: {user1}
  password: "foobarloremipsum"
  group: "mine"
  targets:
    - {target1}

- username: {user2}
  password: "foobarlorem IPSUM!!"
  group:
    - "mine"
    - "analyst"
  targets:
    - {target2}
"""


class TestLoadProfilesCommand(BaseTestCase):

    def setUp(self):
        self.target1 = Target.objects.first().canonical_name
        self.target2 = Target.objects.last().canonical_name
        self.user1 = f"test-1-{secrets.token_urlsafe(8)}"
        self.user2 = f"test-2-{secrets.token_urlsafe(8)}"

    def create_file(self, contents):
        fd, path = tempfile.mkstemp(text=True)
        os.close(fd)
        self.files = [*getattr(self, "files", ()), Path(path)]
        with open(path, "w") as f:
            f.write(contents)
        return path

    def tearDown(self):
        for f in getattr(self, "files", ()):
            f.unlink()

    def test_loadevents_command(self):
        filepath = self.create_file(TEST_FILE.format(
            target1=self.target1,
            target2=self.target2,
            user1=self.user1,
            user2=self.user2,
        ))
        management.call_command(
            "loadprofiles",
            filepath,
        )

        profile1 = UserProfile.objects.filter(user__username=self.user1).first()
        self.assertEqual(set(profile1.user.groups.values_list("name", flat=True)), set(["mine"]))
        self.assertTrue(profile1 is not None, "profile 1 wasn't created")
        self.assertTrue(profile1.targets.first() is not None, "profile 1 wasn't linked to a target")
        self.assertEqual(profile1.targets.first().canonical_name, self.target1)

        profile2 = UserProfile.objects.filter(user__username=self.user2).first()
        self.assertEqual(set(profile2.user.groups.values_list("name", flat=True)), set(["analyst", "mine"]))
        self.assertTrue(profile2 is not None, "profile 2 wasn't created")
        self.assertTrue(profile2.targets.first() is not None, "profile 2 wasn't linked to a target")
        self.assertEqual(profile2.targets.first().canonical_name, self.target2)
