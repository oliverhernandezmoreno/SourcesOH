from pathlib import Path
import sys

from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.core.management.base import BaseCommand
import yaml

from entities.models import UserProfile
from targets.models import Target


class Command(BaseCommand):
    help = "Loads user profiles from a YAML-formatted file"

    def load_data(self, data_file):
        if not data_file or data_file == "-":
            return yaml.load(sys.stdin, Loader=yaml.FullLoader)
        filepath = Path(data_file)
        if not filepath.is_absolute():
            filepath = Path(settings.BASE_DIR) / filepath
        with open(filepath) as f:
            return yaml.load(f, Loader=yaml.FullLoader)

    def add_arguments(self, parser):
        parser.add_argument("file", nargs="?", help="Path to the YAML data file (stdin if omitted or '-')")

    def handle(self, *args, **kwargs):
        verbosity = kwargs.get("verbosity", 1)

        userdata = self.load_data(kwargs.get("file"))
        User = get_user_model()

        for data in userdata:
            user = User.objects.filter(username=data.get("username")).first()
            if user is not None:
                if verbosity > 0:
                    self.stdout.write(f"User {data.get('username')} already exists, skipping setup")
                continue
            user = User.objects.create_user(
                data.get("username"),
                email=data.get("email"),
                password=data.get("password"),
                first_name=data.get("first_name", ""),
                last_name=data.get("last_name", ""),
            )
            groups = Group.objects.filter(
                name__in=data.get("group", [])
                if isinstance(data.get("group", []), list)
                else [data.get("group")]
            )
            user.groups.set(groups)
            profile = UserProfile.objects.get(user=user)
            targets = Target.objects.filter(canonical_name__in=data.get("targets", [])).all()
            profile.targets.set(targets)
            profile.save()
            if verbosity > 0:
                self.stdout.write(f"User {data.get('username')} was setup correctly")
