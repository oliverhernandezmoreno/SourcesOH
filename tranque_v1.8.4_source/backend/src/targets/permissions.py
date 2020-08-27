import itertools

from base.permissions import ModelExtraPermissions
from targets.constants import ACCESS_SCOPES, DATA_SCOPES


class ReportFormsExtraPermissions(ModelExtraPermissions):
    model = 'targets.Target'
    tag = 'app nav'

    @property
    def permissions(self):
        for access, data in itertools.product(ACCESS_SCOPES, DATA_SCOPES):
            yield (
                f'view.{data}.{access}',
                f'Access {data} data from {access} view',
            )
