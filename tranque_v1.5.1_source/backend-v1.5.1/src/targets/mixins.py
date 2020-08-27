from rest_framework.exceptions import NotFound

from base.permissions import UserPermissionChecker
from targets.models import Target


class NestedInTargetMixin:
    _target = None
    _checker = None

    def resolve_target(self):
        cn = self.kwargs.get("target_canonical_name")
        target = Target.objects.filter(canonical_name=cn).first()
        if target is None:
            raise NotFound(detail="Target not found.")
        return target

    @property
    def target(self):
        if self._target is None:
            self._target = self.resolve_target()
        return self._target

    def has_target_perm(self, codename):
        if self._checker is None:
            self._checker = UserPermissionChecker(self.request.user)
        perm = f'targets.{codename}'
        return self._checker.has_perm(perm, self.target)
