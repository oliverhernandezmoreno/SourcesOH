from django.conf import settings
from django.contrib.auth import get_user_model, models
from django.core.management.base import BaseCommand
from django.db import transaction
from rest_framework.authtoken.models import Token


class Command(BaseCommand):
    help = """Asserts the existence of the given internal user and the specified
    token. An internal user is one that doesn't have a set password and
    belongs to the 'internal' group."""

    def add_arguments(self, parser):
        parser.add_argument("username", help="The internal user's name")
        parser.add_argument("token", help="The token assigned to the internal user")

    def handle(self, *args, **kwargs):
        verbosity = kwargs.get("verbosity", 1)
        username = kwargs["username"]
        token_key = kwargs["token"]
        User = get_user_model()
        with transaction.atomic():
            group, _ = models.Group.objects.get_or_create(name=settings.INTERNAL_USERS_GROUP)
            user = User.objects.filter(username=username).first()
            if not user:
                user = User.objects.create_user(username)
                if verbosity > 0:
                    self.stdout.write(f"Created internal user {username}")
            if group.pk not in set(g.pk for g in user.groups.all()):
                user.groups.add(group)
            token = Token.objects.filter(user=user).first()
            if not token:
                Token.objects.create(key=token_key, user=user)
                if verbosity > 0:
                    self.stdout.write(f"Created token {token_key}")
            elif token.key != token_key:
                if verbosity > 0:
                    self.stdout.write("Found obsolete token; replacing ...")
                token.delete()
                Token.objects.create(key=token_key, user=user)
                if verbosity > 0:
                    self.stdout.write(f"Replaced old token with {token_key}")
