from targets.role_groups.base import create_target_group, NAV_PERMS


def create_e700_groups(target, write):
    prefix = 'reportforms.form.'
    # miner editor
    create_target_group(target, 'forms.miner.editor', [
        NAV_PERMS['miner']['e700'],
        f'{prefix}read',
        f'{prefix}edit',
    ], write)
    # miner validator
    create_target_group(target, 'forms.miner.validator', [
        NAV_PERMS['miner']['e700'],
        f'{prefix}read',
        f'{prefix}validate',
    ], write)
    # miner sender
    create_target_group(target, 'forms.miner.sender', [
        NAV_PERMS['miner']['e700'],
        f'{prefix}read',
        f'{prefix}send',
        f'{prefix}reassign.request',
    ], write)
    # authority
    create_target_group(target, 'forms.authority', [
        NAV_PERMS['authority']['e700'],
        f'{prefix}read',
        f'{prefix}create',
        f'{prefix}review',
        f'{prefix}reassign.resolve',
        f'{prefix}case.read',
        f'{prefix}case.create',
        f'{prefix}case.reassign',
        f'{prefix}case.update',
        f'{prefix}case.comment',
    ], write)
