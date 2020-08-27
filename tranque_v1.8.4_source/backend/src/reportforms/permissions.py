from base.permissions import ModelExtraPermissions


class ReportFormsExtraPermissions(ModelExtraPermissions):
    model = 'targets.Target'
    tag = 'report forms'
    permissions = [
        (
            'reportforms.form.read',
            f'Read form',
        ),
        (
            'reportforms.form.create',
            f'Assign form to target',
        ),
        (
            'reportforms.form.edit',
            f'Answer form',
        ),
        (
            'reportforms.form.validate',
            f'Validate form answer',
        ),
        (
            'reportforms.form.send',
            f'Send form for reviewing',
        ),
        (
            'reportforms.form.reassign.request',
            f'Request form reassignment',
        ),
        (
            'reportforms.form.reassign.resolve',
            f'Resolve form reassignment',
        ),
        (
            'reportforms.form.review',
            f'Review form answers, read and add comments',
        ),
        (
            'reportforms.form.case.read',
            f'Read form case',
        ),
        (
            'reportforms.form.case.create',
            f'Add form case',
        ),
        (
            'reportforms.form.case.update',
            f'Update form case',
        ),
        (
            'reportforms.form.case.comment',
            f'Add form case comment',
        ),
        (
            'reportforms.form.case.reassign',
            f'Reassign form instance from case',
        ),
    ]
