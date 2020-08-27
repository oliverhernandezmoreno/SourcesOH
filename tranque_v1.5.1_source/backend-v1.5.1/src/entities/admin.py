from django import forms
from django.contrib import admin
from django.contrib.admin import ModelAdmin
from django.contrib.admin.widgets import FilteredSelectMultiple
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin
from django.contrib.auth.models import User, Group, Permission
from django.db.models import Q
from django.utils.translation import gettext_lazy as _
from reversion.admin import VersionAdmin

from base.admin import json_enabled_form
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


EXCLUDED_GROUPS = [
    'analyst',
    'internal-operations',
]


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
    inlines = [UserProfileInline]

    # Filter list User
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        # If superuser show all users
        if request.user.is_superuser:
            return qs
        # For non-superusers show users in visible groups or with no group
        # this will exclude users that only have internal groups like internal-operation
        return qs.exclude(Q(groups__name__in=EXCLUDED_GROUPS)).distinct()

    def formfield_for_manytomany(self, db_field, request, **kwargs):
        if not request.user.is_superuser and db_field.name == "groups":
            # Filter available group options in edit form
            # For non-superusers only show visible groups
            kwargs["queryset"] = Group.objects.exclude(name__in=EXCLUDED_GROUPS)
        return super().formfield_for_manytomany(db_field, request, **kwargs)


admin.site.unregister(User)
admin.site.register(get_user_model(), UserAdmin)


@admin.register(Permission)
class PermissionAdmin(ModelAdmin):
    search_fields = ("codename",)
    list_display = ("codename", "name")
