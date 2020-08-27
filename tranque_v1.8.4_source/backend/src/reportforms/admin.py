from django.contrib import admin
from reversion.admin import VersionAdmin

from base.admin import json_enabled_form
from reportforms.models import (
    ReportForm,
    ReportFormVersion,
    ReportFormInstance,
    FormInstanceRequest
)


@admin.register(ReportForm)
class ReportFormAdmin(VersionAdmin):
    list_display = ("form_name",)
    form = json_enabled_form(ReportForm)

    def form_name(self, obj):
        return obj.name


@admin.register(ReportFormVersion)
class ReportFormVersionAdmin(VersionAdmin):
    form = json_enabled_form(ReportFormVersion)


@admin.register(ReportFormInstance)
class ReportFormInstanceAdmin(VersionAdmin):
    list_display = ("form_title", "created_at", "state")
    form = json_enabled_form(ReportFormInstance)

    def form_title(self, obj):
        return str(obj)


admin.site.register(FormInstanceRequest)
