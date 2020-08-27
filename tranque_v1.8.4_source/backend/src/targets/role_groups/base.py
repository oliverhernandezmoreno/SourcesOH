from django.contrib.auth.models import Group, Permission
from guardian.shortcuts import assign_perm

from targets.constants import DATA_SCOPES, ACCESS_SCOPES

NAV_PERMS = {
    'miner': {
        'e700': f'view.{DATA_SCOPES.E700}.{ACCESS_SCOPES.miner}',
        'ef': f'view.{DATA_SCOPES.EF}.{ACCESS_SCOPES.miner}',
        'emac': f'view.{DATA_SCOPES.EMAC}.{ACCESS_SCOPES.miner}',
    },
    'authority': {
        'e700': f'view.{DATA_SCOPES.E700}.{ACCESS_SCOPES.authority}',
        'ef': f'view.{DATA_SCOPES.EF}.{ACCESS_SCOPES.authority}',
        'emac': f'view.{DATA_SCOPES.EMAC}.{ACCESS_SCOPES.authority}',
    }
}


def create_target_group(target, group_name, perms, write):
    _group_name = f'{target.canonical_name}.{group_name}'
    write(_group_name, 0)
    group, _ = Group.objects.get_or_create(name=_group_name)
    for codename in ['view_target', *perms]:
        write(f'  {codename}', 1)
        assign_perm(
            Permission.objects.get(codename=codename, content_type__app_label='targets'),
            group,
            target
        )
