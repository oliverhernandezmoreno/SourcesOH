import copy

from django import forms
from django.contrib.auth.models import Permission
from django.contrib.contenttypes.models import ContentType
from django_admin_json_editor import JSONEditorWidget
from guardian.admin import GuardedModelAdminMixin, AdminGroupObjectPermissionsForm, AdminUserObjectPermissionsForm
from guardian.shortcuts import remove_perm, assign_perm

from base.fields import ValidatedJSONField


def json_enabled_form(model, form_opts=None, meta_opts=None):
    meta = type(
        "Meta",
        (),
        {
            "model": model,
            "fields": "__all__",
            **(meta_opts or {}),
            "widgets": {
                **{
                    k: JSONEditorWidget(copy.deepcopy(model._meta.get_field(k).schema), collapsed=True)
                    for k in (
                        field.name
                        for field in model._meta.get_fields()
                        if isinstance(field, ValidatedJSONField)
                    )
                },
                **(meta_opts or {}).get("widgets", {}),
            },
        },
    )
    return type(
        f"{model.__name__}Form",
        (forms.ModelForm,),
        {
            **(form_opts or {}),
            "Meta": meta,
        },
    )


class SaveObjPermMixin:
    _user_or_group_attr = None

    def save_obj_perms(self):
        perms = set(self.cleaned_data[self.get_obj_perms_field_name()])
        model_perms = {c[0] for c in self.get_obj_perms_field_choices()}
        init_perms = set(self.get_obj_perms_field_initial())

        content_type = ContentType.objects.get_for_model(self.obj)
        user_or_group = getattr(self, self._user_or_group_attr)

        to_remove = (model_perms - perms) & init_perms

        for perm in to_remove:
            remove_perm(
                Permission.objects.get(codename=perm, content_type=content_type),
                user_or_group,
                self.obj
            )

        for perm in perms - init_perms:
            assign_perm(
                Permission.objects.get(codename=perm, content_type=content_type),
                user_or_group,
                self.obj
            )


class CustomAdminUserObjectPermissionsForm(SaveObjPermMixin, AdminUserObjectPermissionsForm):
    _user_or_group_attr = 'user'


class CustomAdminGroupObjectPermissionsForm(SaveObjPermMixin, AdminGroupObjectPermissionsForm):
    _user_or_group_attr = 'group'


class CustomGuardedModelAdminMixin(GuardedModelAdminMixin):
    def get_obj_perms_manage_group_form(self, request):
        return CustomAdminGroupObjectPermissionsForm

    def get_obj_perms_manage_user_form(self, request):
        return CustomAdminUserObjectPermissionsForm
