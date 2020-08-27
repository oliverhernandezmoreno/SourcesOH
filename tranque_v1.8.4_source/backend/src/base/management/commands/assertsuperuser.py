from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Asserts the existence of the given superuser"

    def add_arguments(self, parser):
        parser.add_argument("username", help="The superuser's username")
        parser.add_argument("password", help="The superuser's password")

    def handle(self, *args, **kwargs):
        verbosity = kwargs.get("verbosity", 1)
        username = kwargs["username"]
        password = kwargs["password"]
        User = get_user_model()
        user = User.objects.filter(username=username).first()
        if not user:
            User.objects.create_superuser(username, None, password)
            if verbosity > 0:
                self.stdout.write(f"Created superuser {username}")
        else:
            if verbosity > 0:
                self.stdout.write(f"User {username} already exists")
            if not user.is_superuser:
                if verbosity > 0:
                    self.stdout.write(f"The user {username} is NOT a superuser and its status DID NOT change")
