from rest_framework.exceptions import NotFound

from base.permissions import UserPermissionChecker
from targets.models import Target


class NestedInTargetMixin:
    def resolve_target(self):
        cn = self.kwargs.get("target_canonical_name")
        target = Target.objects.filter(canonical_name=cn).first()
        if target is None:
            raise NotFound(detail="Target not found.")
        return target

    @property
    def target(self):
        _target = getattr(self, '_target', None)
        if _target is None:
            _target = self.resolve_target()
            setattr(self, '_target', _target)
        return _target

    def has_target_perm(self, codename):
        checker = getattr(self, '_checker', None)
        if checker is None:
            checker = UserPermissionChecker(self.request.user)
            checker.prefetch_perms([self.target])
            setattr(self, '_checker', checker)
        perm = f'targets.{codename}'
        return checker.has_perm(perm, self.target)
