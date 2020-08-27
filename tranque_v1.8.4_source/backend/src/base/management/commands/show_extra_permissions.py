from django.core.management.base import BaseCommand

from base.permissions import extra_permissions


class Command(BaseCommand):
    help = "show list of permissions defined in classes extending ModelExtraPermissions"

    def add_arguments(self, parser):
        parser.add_argument(
            "-m",
            "--model",
            help="model to filter list of permissions",
        )

    def _write(self, model, permissions):
        self.stdout.write(self.style.SQL_TABLE(f"[{model}]"))
        for code, description in permissions:
            _code = self.style.SQL_FIELD(code)
            _description = self.style.HTTP_SUCCESS(description)
            self.stdout.write(f'"{_code}", {_description}')
        if len(permissions) == 0:
            self.stdout.write(self.style.SQL_KEYWORD('No extra permissions'))

    def handle(self, *args, **kwargs):
        model = kwargs.get("model", None)
        if model is not None:
            self._write(model, extra_permissions[model] if model in extra_permissions else [])
        else:
            for model, permissions in extra_permissions.items():
                self._write(model, permissions)
