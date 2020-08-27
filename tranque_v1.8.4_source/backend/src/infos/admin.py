from django.contrib import admin
from reversion.admin import VersionAdmin

from infos.models import Info, SiteParameter


@admin.register(Info)
class InfoAdmin(admin.ModelAdmin):
    model = Info


@admin.register(SiteParameter)
class SiteParameterAdmin(VersionAdmin):
    list_display = ("name", "value")
