import tempfile

from django.conf import settings
from django.contrib import admin
from django.contrib import messages
from django.db.models import Count, Q
from django.http import FileResponse
from django.utils import html
from django.utils.safestring import mark_safe
from django.utils.translation import gettext_lazy as _
from reversion.admin import VersionAdmin

import targets.exporters.excel
from alerts import engine
from base.admin import json_enabled_form, CustomGuardedModelAdminMixin
from base.management import daemon_call_command
from targets import graphs
from targets.models import (
    AcquiredProtocol,
    Camera,
    DataSource,
    DataSourceGroup,
    Frequency,
    MeasurementProtocol,
    MeasurementUnit,
    Parameter,
    Target,
    TargetMap,
    TargetState,
    TargetType,
    Threshold,
    Timeseries,
    VideoFrame,
    Zone,
    ZoneType
)


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
    list_display = ("name", "canonical_name", "zone", "type", "state", "worksites")
    list_select_related = ("zone", "type", "state")
    filter_horizontal = ("work_sites",)
    form = json_enabled_form(Target)
    search_fields = ("name", "zone__natural_name")
    actions = list(filter(bool, [
        "run_alerts_engine", "apply_ef_profile", "apply_emac_profile", "clear_timeseries",
        "create_default_groups",
        "clean_permissions" if settings.DEBUG else None
    ]))

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

    def clean_permissions(self, request, queryset):
        daemon_call_command("clean_permissions", '--apps=targets', '--verbosity=0')
        self.message_user(
            request,
            f"Started task to update targets permissions",
        )

    clean_permissions.short_description = 'Clean permissions of "targets" app'

    def create_default_groups(self, request, queryset):
        daemon_call_command("createtargetgroups", *[t.canonical_name for t in queryset], '--verbosity=0')
        self.message_user(
            request,
            f"Started task to update target{'s' if queryset.count() > 1 else ''} groups",
        )

    create_default_groups.short_description = 'Create default roles groups for selected targets'

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
    list_display = ("name", "canonical_name", "parent_groups", "target")
    list_filter = (
        ("target", admin.RelatedOnlyFieldListFilter),
    )
    filter_horizontal = ("parents",)
    search_fields = ("name", "canonical_name")

    def parent_groups(self, obj):
        return ", ".join(group.name for group in obj.parents.all())


@admin.register(DataSource)
class DataSourceAdmin(VersionAdmin):
    list_display = ("name", "canonical_name", "datasource_groups", "target")
    list_filter = (
        ("target", admin.RelatedOnlyFieldListFilter),
    )
    filter_horizontal = ("groups",)
    form = json_enabled_form(DataSource)
    save_as = True
    search_fields = ("name", "canonical_name", "hardware_id")

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related("target").prefetch_related("groups")

    def datasource_groups(self, obj):
        return ", ".join(group.name for group in obj.groups.all())


class ThresholdInline(admin.TabularInline):
    model = Threshold
    extra = 0


class FrequencyInline(admin.TabularInline):
    model = Frequency
    extra = 0


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


class WithThresholdFilter(admin.SimpleListFilter):
    title = _('having or requiring thresholds')

    parameter_name = 'with_thresholds'

    def lookups(self, request, model_admin):
        return (("y", "Yes"), ("n", "No"))

    def queryset(self, request, queryset):
        if self.value() in ("y", "n"):
            return (
                queryset
                .annotate(active_thresholds_count=Count("thresholds", filter=Q(thresholds__active=True)))
                .filter(**(
                    {"active_thresholds_count__gt": 0}
                    if self.value() == "y"
                    else {"active_thresholds_count": 0}
                ))
            )


class WithFrequencyFilter(admin.SimpleListFilter):
    title = _('having a specific frequency')

    parameter_name = 'with_frequency'

    def lookups(self, request, model_admin):
        return (("y", "Yes"), ("n", "No"))

    def queryset(self, request, queryset):
        if self.value() in ("y", "n"):
            return (
                queryset
                .annotate(frequencies_count=Count("frequencies"))
                .filter(**(
                    {"frequencies_count__gt": 0}
                    if self.value() == "y"
                    else {"frequencies_count": 0}
                ))
            )


@admin.register(Timeseries)
class TimeseriesAdmin(VersionAdmin):
    list_display = (
        "name",
        "canonical_name",
        "type",
        "active",
        "highlight",
    )
    exclude = ("script",)
    list_select_related = ("target",)
    list_filter = (
        ("target", admin.RelatedOnlyFieldListFilter),
        ManifestListFilter,
        WithThresholdFilter,
        WithFrequencyFilter,
        "active",
    )
    filter_horizontal = ("inputs",)
    search_fields = ("name", "canonical_name")
    readonly_fields = ("get_script",)
    form = json_enabled_form(Timeseries)
    inlines = [ThresholdInline, FrequencyInline]
    actions = ["highlight", "export", "inputs_graph", "derivations_graph"]

    def highlight(self, request, queryset):
        total = queryset.count()
        queryset.update(highlight=True)
        self.message_user(request, f"{total} timseries were highlighted")

    highlight.short_description = "Highlight the selected timeseries"

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


@admin.register(Camera)
class CameraAdmin(VersionAdmin):
    list_display = (
        "name",
        "target",
        "label",
        "id",
    )


@admin.register(TargetMap)
class TargetMapAdmin(VersionAdmin):
    list_display = ("id", "name", "image", "target")
    readonly_fields = ["map_image"]
    form = json_enabled_form(TargetMap)

    def map_image(self, obj):
        return mark_safe('<img src="{url}" width="{width}" height="{height}" />'.format(
            url=obj.image.url,
            width=obj.image.width,
            height=obj.image.height
        ))


@admin.register(VideoFrame)
class VideoFrameAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "camera",
        "timestamp",
        "target",
    )

    def target(self, obj):
        return obj.camera.target.canonical_name
