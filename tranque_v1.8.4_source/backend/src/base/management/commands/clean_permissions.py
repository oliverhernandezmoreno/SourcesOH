from django.apps import apps as django_apps
from django.contrib.auth.management import create_permissions, _get_all_permissions
from django.contrib.auth.models import Permission
from django.contrib.contenttypes.models import ContentType
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    """
    Based on django extensions
    https://github.com/django-extensions/django-extensions
    update_permissions command
    """
    help = 'creates missing permissions and updates name of existing ones'

    def add_arguments(self, parser):
        super().add_arguments(parser)
        parser.add_argument('--apps', dest='apps', help='Reload permissions only for apps (comma separated)')

    def model_handle(self, model, verbosity):
        content_type = ContentType.objects.get_for_model(model)
        codenames = []
        for codename, name in _get_all_permissions(model._meta):
            codenames.append(codename)
            try:
                permission = Permission.objects.get(codename=codename, content_type=content_type)
            except Permission.DoesNotExist:
                self.stdout.write(
                    self.style.ERROR(f'Permission {codename} of {content_type.app_label} does not exists'))
                continue
            if permission.name != name:
                if verbosity >= 2:
                    old_name = self.style.SUCCESS(permission.codename)
                    new_name = self.style.SUCCESS(name)
                    self.stdout.write(f'Updating permission {old_name} to {new_name}')
                permission.name = name
                permission.save()
        # remove old permissions
        old_permissions = Permission.objects.filter(content_type=content_type).exclude(codename__in=codenames)
        if verbosity >= 2 and old_permissions.count() > 0:
            for old_perm in old_permissions:
                code = self.style.WARNING(old_perm.codename)
                model_name = f'{content_type.app_label}.{model.__name__}'
                self.stdout.write(f'Removing {code} no longer in {model_name}')
        old_permissions.delete()

    def app_handle(self, app, verbosity):
        # create permissions if they do not exist
        create_permissions(app, verbosity)

        # update permission name's if changed
        for model in app.get_models():
            self.model_handle(model, verbosity)

    def handle(self, *args, **options):
        if options['apps']:
            app_names = options['apps'].split(',')
            apps = [django_apps.get_app_config(x) for x in app_names]
        else:
            apps = django_apps.get_app_configs()

        for app in apps:
            self.app_handle(app, options['verbosity'])
