import importlib
import inspect
import logging
from pathlib import Path

from django.conf import settings
from guardian.core import ObjectPermissionChecker
from rest_framework import permissions

logger = logging.getLogger(__name__)


class InternalOnly(permissions.BasePermission):
    message = "This endpoint is for internal use only"

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True
        if request.user.groups.filter(name=settings.INTERNAL_USERS_GROUP).exists():
            return True
        return False


class StaffOnly(permissions.BasePermission):
    message = "This endpoint is for staff members only"

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        return request.user.is_staff or request.user.is_superuser


class Authenticated(permissions.BasePermission):
    message = "This endpoint is for authenticated users only"

    def has_permission(self, request, view):
        return request.user.is_authenticated


class ModelExtraPermissions:
    # string of the model whose permission should be extended
    # format is <app>.<Model> e.g. targets.Target
    model = None
    # string to prepend with brackets in description "[tag] description..." when collecting extra permissions
    tag = None

    # Extra permissions to enter into the permissions table when creating <model> object
    # https://docs.djangoproject.com/en/2.2/ref/models/options/#permissions
    # iterable in the format (permission_code, human_readable_permission_name)
    permissions = []

    # Note: Meta class inside <model> class should set the permissions attribute
    # with permissions = get_extra_permissions('app.Model')


def collect_extra_permissions():
    """Attempt to collect extra permissions for models"""
    ret = dict()
    for path in Path(settings.BASE_DIR).glob('**/*permissions.py'):
        module = '.'.join(str(path.relative_to(Path(settings.BASE_DIR)))[:-3].split('/'))
        # noinspection PyBroadException
        try:
            mod = importlib.import_module(module)
        except Exception:
            continue
        instances = [
            cls()
            for name, cls in mod.__dict__.items()
            if inspect.isclass(cls) and issubclass(cls, ModelExtraPermissions) and cls is not ModelExtraPermissions
        ]
        for i in instances:
            if i.model not in ret:
                ret[i.model] = dict()
            for perm in i.permissions:
                ret[i.model][perm[0]] = (perm[0], f'[{i.tag}] {perm[1]}')
    by_model = {model: list(perms.values()) for model, perms in ret.items()}

    def sort_codename(val):
        return val[0]

    for key in by_model:
        by_model[key].sort(key=sort_codename)
    return by_model


extra_permissions = collect_extra_permissions()


def get_extra_permissions(model):
    return extra_permissions[model] if model in extra_permissions else []


class UserPermissionChecker(ObjectPermissionChecker):
    def has_perm(self, perm, obj):
        return super().has_perm(perm, obj) or self.user.has_perm(perm)
