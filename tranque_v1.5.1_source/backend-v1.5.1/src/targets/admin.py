import tempfile

from django.contrib import admin
from django.contrib import messages
from django.http import FileResponse
from django.utils import html
from django.utils.translation import gettext_lazy as _
from reversion.admin import VersionAdmin

import targets.exporters.excel
from alerts import engine
from base.admin import json_enabled_form, CustomGuardedModelAdminMixin
from targets import graphs
from targets.models import AcquiredProtocol
from targets.models import DataSource
from targets.models import DataSourceGroup
from targets.models import Frequency
from targets.models import MeasurementProtocol
from targets.models import MeasurementUnit
from targets.models import Parameter
from targets.models import Target
from targets.models import TargetState
from targets.models import TargetType
from targets.models import Threshold
from targets.models import Timeseries
from targets.models import Zone
from targets.models import ZoneType


@admin.register(Zone)
class ZoneAdmin(VersionAdmin):
    list_display = ("name", "natural_name", "type")
    form = json_enabled_form(Zone)
    search_fields = ("name", "natural_name")
    list_filter = (
        ("type", admin.RelatedOnlyFieldListFilter),
    )


@admin.register(ZoneType)
class ZoneTypeAdmin(VersionAdmin):
    list_display = ("id", "description")


@admin.register(Parameter)
class ParameterAdmin(VersionAdmin):
    list_display = ("name", "canonical_name", "target", "used_in")
    readonly_fields = ("canonical_name", "target")
    list_filter = (
        ("target", admin.RelatedOnlyFieldListFilter),
    )

    def used_in(self, parameter):
        return ", ".join(parameter.get_manifests()) or "-"

    # Limit this form to edition *only*

    def has_add_permission(self, *args, **kwargs):
        return False

    def has_delete_permission(self, *args, **kwargs):
        return False


@admin.register(Target)
class TargetAdmin(CustomGuardedModelAdminMixin, VersionAdmin):
    list_display = ("name", "zone", "type", "state", "worksites")
    list_select_related = ("zone", "type", "state")
    filter_horizontal = ("work_sites",)
    form = json_enabled_form(Target)
    search_fields = ("name", "zone__natural_name")
    actions = ["run_alerts_engine", "apply_ef_profile", "apply_emac_profile", "clear_timeseries"]

    def worksites(self, target):
        return ", ".join(ws.name for ws in target.work_sites.all())

    def run_alerts_engine(self, request, queryset):
        total = queryset.count()
        affected = 0
        for target in queryset.all():
            affected += len(engine.run(target))
        self.message_user(
            request,
            f"The alerts engine was run on {total} targets affecting a total of {affected} tickets",
        )

    run_alerts_engine.short_description = "Run the alerts engine on the selected targets"

    def apply_ef_profile(self, request, queryset):
        total = queryset.count()
        for target in queryset.all():
            target.apply_manifest_async("ef")
        self.message_user(request, f"{total} targets were scheduled to be given the EF profile")

    apply_ef_profile.short_description = "Apply the EF profile to the selected targets"

    def apply_emac_profile(self, request, queryset):
        total = queryset.count()
        for target in queryset.all():
            target.apply_manifest_async("emac")
        self.message_user(request, f"{total} targets were scheduled to be given the EMAC profile")

    apply_emac_profile.short_description = "Apply the EMAC profile to the selected targets"

    def clear_timeseries(self, request, queryset):
        total = queryset.count()
        for target in queryset.all():
            Timeseries.objects.filter(target=target, template_name__isnull=False).delete()
        self.message_user(request, f"{total} targets were fully cleared of time series")

    clear_timeseries.short_description = "Clear all time series for the selected targets"


@admin.register(TargetState)
class TargetStateAdmin(VersionAdmin):
    list_display = ("id", "description", "default")


@admin.register(TargetType)
class TargetTypeAdmin(VersionAdmin):
    list_display = ("id", "description", "default")


@admin.register(DataSourceGroup)
class DataSourceGroupAdmin(VersionAdmin):
    list_display = ("name", "target", "canonical_name")
    list_filter = (
        ("target", admin.RelatedOnlyFieldListFilter),
    )
    filter_horizontal = ("parents",)


@admin.register(DataSource)
class DataSourceAdmin(VersionAdmin):
    list_display = ("name", "canonical_name", "datasource_groups", "target")
    filter_horizontal = ("groups",)
    form = json_enabled_form(DataSource)
    save_as = True

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related("target").prefetch_related("groups")

    def datasource_groups(self, obj):
        return ", ".join(group.name for group in obj.groups.all())


class ThresholdInline(admin.StackedInline):
    model = Threshold
    extra = 1


class ManifestListFilter(admin.SimpleListFilter):
    title = _('index')

    parameter_name = 'index'

    def lookups(self, request, model_admin):
        from targets.profiling import MANIFESTS
        return tuple((k, k.upper()) for k in MANIFESTS)

    def queryset(self, request, queryset):
        from targets.profiling import MANIFESTS
        if self.value() in MANIFESTS:
            return queryset.filter(script_version__startswith=f"{self.value()}:")


@admin.register(Timeseries)
class TimeseriesAdmin(VersionAdmin):
    list_display = (
        "name",
        "canonical_name",
        "type",
        "highlight",
        "protocols",
    )
    exclude = ("script",)
    list_select_related = ("target",)
    list_filter = (
        ("target", admin.RelatedOnlyFieldListFilter),
        ManifestListFilter,
    )
    filter_horizontal = ("inputs",)
    search_fields = ("name", "canonical_name")
    readonly_fields = ("get_script",)
    form = json_enabled_form(Timeseries)
    inlines = [ThresholdInline]
    actions = ["export", "inputs_graph", "derivations_graph"]

    def protocols(self, obj):
        return ", ".join(obj.active_acquired_protocols.values_list("protocol", flat=True))

    def export(self, request, queryset):
        try:
            output = targets.exporters.excel.export_timeseries(queryset)
            return FileResponse(
                output,
                as_attachment=True,
                filename="exported-timeseries.xlsx",
                content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            )
        except ValueError as e:
            self.message_user(request, " ".join(str(arg) for arg in e.args), messages.ERROR)

    export.short_description = "Download timeseries data as excel"

    def _graph(self, request, queryset, direction):
        tmp = tempfile.TemporaryFile()
        try:
            tmp = tempfile.TemporaryFile()
            graphs.graph(queryset, tmp, direction=direction)
            tmp.seek(0)
            return FileResponse(tmp, content_type="image/svg+xml")
        except ValueError:
            self.message_user(request, f"Couldn't render {direction} graph", level=messages.ERROR)

    def inputs_graph(self, request, queryset):
        return self._graph(request, queryset, "inputs")

    inputs_graph.short_description = "Render inputs graph"

    def derivations_graph(self, request, queryset):
        return self._graph(request, queryset, "derivations")

    derivations_graph.short_description = "Render derivations graph"

    def get_script(self, obj):
        return html.format_html("<pre>{}</pre>", obj.script)

    get_script.short_description = "Script"


@admin.register(MeasurementProtocol)
class MeasurementProtocolAdmin(VersionAdmin):
    list_display = ("id", "description")


@admin.register(AcquiredProtocol)
class AcquiredProtocolAdmin(VersionAdmin):
    list_display = ("timeseries", "protocol", "active", "created_at")
    list_select_related = ("timeseries",)
    list_filter = (
        "active",
        "created_at",
        ("timeseries", admin.RelatedOnlyFieldListFilter),
    )


@admin.register(MeasurementUnit)
class MeasurementUnitAdmin(VersionAdmin):
    list_display = ("name", "abbreviation", "si", "si_unit")


@admin.register(Frequency)
class FrequencyAdmin(VersionAdmin):
    list_display = (
        "timeseries_name",
        "protocol",
        "minutes",
        "tolerance_lower",
        "tolerance_upper",
    )

    def timeseries_name(self, obj):
        return obj.timeseries.name

    def get_queryset(self, request):
        return super().get_queryset(request).select_related("timeseries")
