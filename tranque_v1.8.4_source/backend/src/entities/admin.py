from django import forms
from django.contrib import admin
from django.contrib.admin import ModelAdmin
from django.contrib.admin.widgets import FilteredSelectMultiple
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin, GroupAdmin
from django.contrib.auth.forms import UserChangeForm
from django.contrib.auth.models import User, Group, Permission
from django.utils.translation import gettext_lazy as _
from reversion.admin import VersionAdmin

from base.admin import json_enabled_form, get_non_default_permissions
from entities.models import Entity, UserProfile
from entities.models import EntityType
from entities.models import WorkSite
from targets.models import Target


@admin.register(Entity)
class EntityAdmin(VersionAdmin):
    search_fields = ("name",)
    list_display = ("id", "type", "name")
    form = json_enabled_form(Entity)


@admin.register(EntityType)
class EntityTypeAdmin(VersionAdmin):
    list_display = ("id", "description")


@admin.register(WorkSite)
class WorkSiteAdmin(VersionAdmin):
    search_fields = ("name",)
    list_display = ("name", "entity")


NON_EDITABLE_GROUPS = [
    'admin',
]

INTERNAL_SYSTEM_GROUPS = [
    'internal-operations',
]

INTERNAL_SYSTEM_USERS = [
    'system',
    'AnonymousUser',
    'cron-user',
    'enrichment-user'
]


def get_visible_users_queryset():
    return get_user_model().objects.exclude(username__in=INTERNAL_SYSTEM_USERS)


class CustomPermissionsField(forms.ModelMultipleChoiceField):
    def label_from_instance(self, obj):
        return obj.name


def get_permissions_field():
    return CustomPermissionsField(
        label='Global permissions',
        required=False,
        queryset=get_non_default_permissions(),
        widget=FilteredSelectMultiple(verbose_name='global permissions', is_stacked=False),
    )


class ProfileForm(forms.ModelForm):
    targets = forms.ModelMultipleChoiceField(
        required=False,
        queryset=Target.objects.all(),
        label="Targets",
        widget=FilteredSelectMultiple(verbose_name="Targets", is_stacked=False),
    )


class UserProfileInline(admin.StackedInline):
    model = UserProfile
    max_num = 0
    can_delete = False
    form = ProfileForm
    verbose_name_plural = "Profile"

    classes = ('no-upper', 'no-header')

    class Media:
        css = {
            'all': ('css/admin/custom_admin.css',)
        }


class CustomUserForm(UserChangeForm):
    user_permissions = get_permissions_field()


class UserAdmin(DjangoUserAdmin):
    list_filter = ('is_staff', 'is_active', ('groups', admin.RelatedOnlyFieldListFilter))
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        (_('Personal info'), {'fields': ('first_name', 'last_name', 'email')}),
        (_('Permissions'), {'fields': ('is_active', 'is_staff', 'groups', 'user_permissions')}),
        (_('Important dates'), {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'password1', 'password2'),
        }),
    )
    readonly_fields = ('last_login', 'date_joined')
    form = CustomUserForm

    # filter User list
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        # if superuser show all users
        if request.user.is_superuser:
            return qs
        # for non-superusers hide internal system users
        return qs.exclude(username__in=INTERNAL_SYSTEM_USERS)

    def formfield_for_manytomany(self, db_field, request, **kwargs):
        if not request.user.is_superuser and db_field.name == "groups":
            # filter available group options in edit form
            # for non-superusers hide internal system groups
            kwargs["queryset"] = Group.objects.exclude(name__in=INTERNAL_SYSTEM_GROUPS)
        return super().formfield_for_manytomany(db_field, request, **kwargs)


admin.site.unregister(User)
admin.site.register(get_user_model(), UserAdmin)


@admin.register(Permission)
class PermissionAdmin(ModelAdmin):
    search_fields = ("codename",)
    list_display = ("codename", "name")

    # filter Permission list
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        # if superuser show all permissions
        if request.user.is_superuser:
            return qs
        # for non-superusers show non default permissions only
        return get_non_default_permissions(qs)


class GroupForm(forms.ModelForm):
    users = forms.ModelMultipleChoiceField(
        required=False,
        queryset=get_visible_users_queryset(),
        widget=FilteredSelectMultiple(verbose_name="Users", is_stacked=False),
    )
    permissions = get_permissions_field()

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance and self.instance.id is not None:
            self.fields["users"].initial = self.instance.user_set.all()

    def save(self, *args, **kwargs):
        instance = super().save(*args, **kwargs)
        if self.instance.id is not None:
            # if id is None means it is creating
            instance.user_set.set(self.cleaned_data["users"])
        return instance


class CustomGroupAdmin(GroupAdmin):
    form = GroupForm

    def get_fieldsets(self, request, obj=None):
        if not obj:
            return ((None, {'fields': ('name',)}),)
        return ((None, {'fields': ('name', 'permissions', 'users')}),)

    # filter Group list
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        # if superuser show all users
        if request.user.is_superuser:
            return qs
        # for non-superusers hide internal system users
        return qs.exclude(name__in=INTERNAL_SYSTEM_GROUPS)

    def editable_group(self, request, obj):
        if request.user.is_superuser:
            return True
        return not (obj is not None and obj.name in NON_EDITABLE_GROUPS)

    def has_change_permission(self, request, obj=None):
        return self.editable_group(request, obj) and super().has_change_permission(request, obj)

    def has_delete_permission(self, request, obj=None):
        return self.editable_group(request, obj) and super().has_delete_permission(request, obj)


admin.site.unregister(Group)
admin.site.register(Group, CustomGroupAdmin)
