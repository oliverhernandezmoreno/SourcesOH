import datetime
import decimal

import jsonschema
import reversion
from django.conf import settings
from django.contrib.gis.db import models
from django.contrib.gis.geos import Point
from django.contrib.postgres.fields import JSONField
from django.db import transaction
from django.db.models.functions import Concat
from django.urls import reverse
from django.utils.text import slugify
from rest_framework.exceptions import ValidationError

from base.fields import AutoUUIDField
from base.fields import MetaJSONField
from base.fields import ValidatedJSONField
from base.fields import injectable_property
from base.management import daemon_call_command
from base.permissions import get_extra_permissions
from base.validators import validate_timestamp
from entities.models import WorkSite
from targets import elastic

COORDS_SCHEMA = {
    "type": "object",
    "properties": {
        "srid": {"type": "number"},
        "x": {"type": "number"},
        "y": {"type": "number"},
    },
    "additionalProperties": False,
    "required": ["x", "y"],
}


@reversion.register()
class ZoneType(models.Model):
    id = models.SlugField(max_length=255, primary_key=True)
    description = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return self.description

    class Meta:
        ordering = ["id"]


@reversion.register()
class Zone(models.Model):
    id = models.CharField(max_length=255, primary_key=True)
    natural_name = models.CharField(max_length=255, unique=True)
    parent = models.ForeignKey(
        "self",
        blank=True,
        null=True,
        on_delete=models.SET_NULL,
        related_name="children",
    )
    type = models.ForeignKey(
        ZoneType,
        on_delete=models.PROTECT,
        related_name="+",
    )
    name = models.CharField(max_length=255)
    canonical_name = models.SlugField(max_length=255)
    target_count = models.IntegerField(default=0)
    coords = ValidatedJSONField(schema=COORDS_SCHEMA)
    geometry = models.PointField(editable=False)

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.canonical_name:
            self.canonical_name = slugify(self.name or "")
        if not self.natural_name:
            parent = Zone.objects.filter(id=self.parent_id).first()
            self.natural_name = (
                ".".join([parent.natural_name, self.canonical_name])
                if parent
                else self.canonical_name
            )
        if self.coords:
            self.geometry = Point(
                self.coords.get("x"),
                self.coords.get("y"),
                srid=self.coords.get("srid", settings.PROJECTION_SRID),
            )
        return super().save(*args, **kwargs)

    def natural_key(self):
        return (self.natural_name,)

    def zone_hierarchy(self):
        return (
            Zone.objects
                .annotate(child=models.Value(self.natural_name, models.CharField()))
                .filter(child__startswith=Concat(models.F('natural_name'), models.Value(".")))
                .cache()
        )

    class Meta:
        ordering = ["natural_name"]


@reversion.register()
class TargetType(models.Model):
    DEFAULT_TYPE = {
        "id": "default",
        "description": "Auto-generated default target type",
        "default": True,
    }

    id = models.SlugField(max_length=255, primary_key=True)
    description = models.CharField(max_length=255, blank=True, null=True)
    default = models.BooleanField(default=False)

    def __str__(self):
        return self.id

    class Meta:
        ordering = ["id"]


@reversion.register()
class TargetState(models.Model):
    DEFAULT_STATE = {
        "id": "default",
        "description": "Auto-generated default target state",
        "default": True,
    }

    id = models.SlugField(max_length=255, primary_key=True)
    description = models.CharField(max_length=255, blank=True, null=True)
    default = models.BooleanField(default=False)

    def __str__(self):
        return self.id

    class Meta:
        ordering = ["id"]


@reversion.register()
class Target(models.Model):
    id = AutoUUIDField()
    name = models.CharField(max_length=510)
    canonical_name = models.SlugField(max_length=510, unique=True)
    work_sites = models.ManyToManyField(
        WorkSite,
        related_name="targets",
        blank=True,
    )
    zone = models.ForeignKey(
        Zone,
        blank=True,
        null=True,
        on_delete=models.SET_NULL,
        related_name="targets",
    )
    type = models.ForeignKey(
        TargetType,
        on_delete=models.PROTECT,
        related_name="+",
    )
    state = models.ForeignKey(
        TargetState,
        on_delete=models.PROTECT,
        related_name="+",
    )
    can_emit_alerts = models.BooleanField(default=False)
    meta = MetaJSONField(default=dict)
    coords = ValidatedJSONField(schema=COORDS_SCHEMA, blank=True, null=True)
    geometry = models.PointField(blank=True, null=True, editable=False)
    perimeter = models.MultiPolygonField(blank=True, null=True)
    remote = models.ForeignKey(
        'remotes.Remote',
        blank=True,
        null=True,
        on_delete=models.PROTECT,
        related_name='targets'
    )

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.canonical_name:
            self.canonical_name = slugify(self.name or "")
            attempt = 1
            while Target.objects.filter(canonical_name=self.canonical_name).exists():
                self.canonical_name = slugify(f"{self.name or ''} DEDUP {attempt}")
                attempt += 1
        if self.coords:
            self.geometry = Point(
                self.coords.get("x"),
                self.coords.get("y"),
                srid=self.coords.get("srid", settings.PROJECTION_SRID),
            )
        return super().save(*args, **kwargs)

    class Meta:
        ordering = ["canonical_name"]
        permissions = get_extra_permissions('targets.Target')

    @injectable_property
    def highlighted_timeseries(self):
        return Timeseries.objects.filter(
            target=self,
            derivations__isnull=True,
            data_source__isnull=True,
            highlight=True,
        )

    def apply_profile(self, profile):
        from targets.profiling import FOREST
        from targets.profiling.base import apply as apply_target_profile
        return apply_target_profile(FOREST[profile], self)

    def apply_manifest(self, manifest):
        from targets.profiling import apply_manifest
        from targets.profiling import MANIFESTS
        return apply_manifest(MANIFESTS[manifest], self)

    def apply_manifest_async(self, manifest):
        daemon_call_command("applytargetmanifest", self.canonical_name, manifest)

    def get_document_folder(self, *suffixes):
        prefix = f'target/{self.canonical_name}/document/'
        folder = "/".join([prefix, *suffixes])
        return folder + ("" if folder.endswith('/') else '/')


@reversion.register()
class Parameter(models.Model):
    id = AutoUUIDField()
    name = models.CharField(max_length=510, null=True, blank=True)
    canonical_name = models.SlugField(max_length=510, db_index=True)
    target = models.ForeignKey(
        Target,
        on_delete=models.CASCADE,
        related_name="parameters",
    )
    value = JSONField(blank=True, null=True)

    def __str__(self):
        return self.name or self.canonical_name

    def get_manifests(self):
        from targets.profiling import MANIFESTS
        return {
            name: manifest
            for name, manifest in MANIFESTS.items()
            if self.canonical_name in manifest.get("parameters", {})
        }

    def get_schema(self):
        manifests = self.get_manifests()
        if not manifests:
            return None
        return next(manifest["parameters"][self.canonical_name].get("schema") for manifest in manifests.values())

    def validate_value(self, *v):
        """Validate the given value, or `self.value` if no value is given"""
        schema = self.get_schema()
        if schema is not None:
            try:
                jsonschema.validate(next(iter((*v, self.value))), schema)
            except jsonschema.ValidationError as e:
                raise ValidationError(e.message)

    class Meta:
        ordering = ["target", "canonical_name"]
        unique_together = (
            ("canonical_name", "target"),
        )


@reversion.register()
class DataSourceGroup(models.Model):
    id = AutoUUIDField()
    target = models.ForeignKey(
        Target,
        on_delete=models.PROTECT,
        related_name="data_source_groups",
    )
    name = models.CharField(max_length=510)
    canonical_name = models.SlugField(max_length=510, editable=False)
    meta = MetaJSONField(blank=True, null=True)
    parents = models.ManyToManyField(
        "self",
        blank=True,
        symmetrical=False,
        related_name="children",
    )

    def __str__(self):
        return f"{self.target.name} - {self.name}"

    def save(self, *args, **kwargs):
        if not self.canonical_name:
            self.canonical_name = slugify(self.name)
        return super().save(*args, **kwargs)

    class Meta:
        ordering = ["target", "canonical_name"]
        unique_together = (
            ("target", "canonical_name"),
        )
        verbose_name = "group"


@reversion.register()
class DataSource(models.Model):
    class DataSourceType:
        UNDEFINED = None
        ONLINE = "online"
        OFFLINE = "offline"
        REFERENCE = "reference"
        choices = (
            (UNDEFINED, "Undefined type"),
            (ONLINE, "On-line instrument"),
            (OFFLINE, "Off-line instrument"),
            (REFERENCE, "Reference point(s) or inert object(s)"),
        )

    excluded_serialization_fields = ("geometry",)

    id = AutoUUIDField()
    hardware_id = models.CharField(max_length=510, db_index=True)
    name = models.CharField(max_length=510, db_index=True)
    canonical_name = models.SlugField(max_length=510, editable=False)
    type = models.CharField(
        max_length=127,
        choices=DataSourceType.choices,
        default=DataSourceType.UNDEFINED,
        blank=True,
        null=True,
        db_index=True,
    )
    target = models.ForeignKey(
        Target,
        on_delete=models.PROTECT,
        related_name="data_sources",
    )
    groups = models.ManyToManyField(
        DataSourceGroup,
        related_name="data_sources",
        blank=True,
    )
    active = models.BooleanField(default=True)
    coords = ValidatedJSONField(schema=COORDS_SCHEMA, blank=True, null=True)
    geometry = models.PointField(blank=True, null=True, editable=False)
    meta = MetaJSONField(blank=True, null=True)

    def __str__(self):
        return f"{self.target.name} - {self.name}"

    def save(self, *args, **kwargs):
        if not self.canonical_name:
            self.canonical_name = slugify(self.name or "")
        if self.coords:
            self.geometry = Point(
                self.coords.get("x"),
                self.coords.get("y"),
                srid=self.coords.get("srid", settings.PROJECTION_SRID),
            )
        return super().save(*args, **kwargs)

    class Meta:
        ordering = ["hardware_id"]
        unique_together = (
            ("target", "hardware_id"),
        )
        verbose_name = "source"

    @injectable_property
    def highlighted_timeseries(self):
        return Timeseries.objects.filter(
            data_source=self,
            highlight=True,
        )

    def profiled(self, template_prefix=None):
        """Whether this data source is linked to timeseries template
        profiling.

        """
        return any(
            ts.template_name is not None and (
                    not template_prefix or
                    ts.template_name[0:len(template_prefix)] == template_prefix
            ) for ts in self.timeseries.all()
        )


@reversion.register()
class MeasurementUnit(models.Model):
    id = models.SlugField(max_length=255, primary_key=True)
    name = models.CharField(max_length=255)
    abbreviation = models.CharField(max_length=255, blank=True, null=True)
    si = models.BooleanField()
    si_unit = models.ForeignKey(
        "self",
        blank=True,
        null=True,
        on_delete=models.SET_NULL,
        related_name="derived_units",
    )
    si_conversion_scale = models.DecimalField(max_digits=16, decimal_places=8, blank=True, null=True)
    si_conversion_shift = models.DecimalField(max_digits=16, decimal_places=8, blank=True, null=True)

    def __str__(self):
        return self.abbreviation or self.name

    def convert_si(self, value):
        """Convert a numeric *value* in the current unit (*self*) into the
        SI-equivalent, returning a pair of (converted value, SI
        unit). If the current unit is already SI, the value is
        returned as-is.

        This procedure exists also as documentation for the
        *si_conversion_scale* and *si_conversion_shift* fields.

        """
        if self.si:
            return decimal.Decimal(value), self
        if self.si_unit is None:
            raise ValueError("no SI unit specified")
        scale = decimal.Decimal(
            self.si_conversion_scale
            if self.si_conversion_scale is not None
            else '1'
        )
        shift = decimal.Decimal(
            self.si_conversion_shift
            if self.si_conversion_shift is not None
            else '0'
        )
        return decimal.Decimal(value) * scale + shift, self.si_unit

    class Meta:
        ordering = ["id"]


@reversion.register()
class Timeseries(models.Model):
    class TimeseriesType:
        RAW = "raw"
        DERIVED = "derived"
        TEST = "test"
        MANUAL = "manual"
        choices = (
            (MANUAL, "Manually input series"),
            (RAW, "Raw series"),
            (DERIVED, "Derived series"),
            (TEST, "Test series"),
        )

    LABELS_SCHEMA = {
        "type": "array",
        "items": {
            "type": "object",
            "properties": {
                "key": {"type": "string"},
                "value": {"type": "string"},
            },
            "additionalProperties": False,
            "required": ["key", "value"],
        },
    }

    CHOICES_SCHEMA = {
        "type": "array",
        "items": {
            "type": "object",
            "properties": {
                "value": {
                    "type": "object",
                    "properties": {
                        "choiceValue": {"type": "number"},
                        "lt": {"type": "number"},
                        "lte": {"type": "number"},
                        "gt": {"type": "number"},
                        "gte": {"type": "number"},
                    },
                    "additionalProperties": False,
                    "required": ["choiceValue"],
                },
                "choice": {"type": "string"},
            },
            "additionalProperties": False,
            "required": ["value", "choice"],
        },
    }

    excluded_serialization_fields = ("script",)

    id = AutoUUIDField()
    # The name of the series as presented to the user
    name = models.CharField(max_length=255)
    # The name of the series in the timeseries store
    canonical_name = models.CharField(max_length=510, unique=True)
    # The name of the template that generated this series
    template_name = models.CharField(max_length=510, blank=True, null=True, db_index=True)
    description = models.TextField(blank=True, null=True)
    highlight = models.BooleanField(default=False, db_index=True)
    active = models.BooleanField(default=True)
    type = models.CharField(
        max_length=127,
        choices=TimeseriesType.choices,
        default=TimeseriesType.RAW,
        db_index=True,
    )
    space_coords = models.CharField(
        max_length=3,
        choices=(
            ("x", "X"),
            ("y", "Y"),
            ("z", "Z"),
            ("xy", "X, Y"),
            ("xz", "X, Z"),
            ("yz", "Y, Z"),
            ("xyz", "X, Y, Z"),
        ),
        blank=True,
        null=True,
    )
    inputs = models.ManyToManyField(
        "self",
        blank=True,
        symmetrical=False,
        related_name="derivations",
    )
    unit = models.ForeignKey(
        MeasurementUnit,
        blank=True,
        null=True,
        on_delete=models.PROTECT,
        related_name="timeseries",
    )
    x_unit = models.ForeignKey(
        MeasurementUnit,
        blank=True,
        null=True,
        on_delete=models.PROTECT,
        related_name="+",
    )
    y_unit = models.ForeignKey(
        MeasurementUnit,
        blank=True,
        null=True,
        on_delete=models.PROTECT,
        related_name="+",
    )
    z_unit = models.ForeignKey(
        MeasurementUnit,
        blank=True,
        null=True,
        on_delete=models.PROTECT,
        related_name="+",
    )
    labels = ValidatedJSONField(schema=LABELS_SCHEMA, blank=True, null=True, default=list)
    choices = ValidatedJSONField(schema=CHOICES_SCHEMA, blank=True, null=True, default=list)
    script = models.TextField(blank=True)
    script_version = models.CharField(max_length=255, blank=True, null=True, editable=False)
    target = models.ForeignKey(
        Target,
        on_delete=models.PROTECT,
        related_name="timeseries",
    )
    data_source = models.ForeignKey(
        DataSource,
        blank=True,
        null=True,
        on_delete=models.PROTECT,
        related_name="timeseries",
    )
    data_source_group = models.ForeignKey(
        DataSourceGroup,
        blank=True,
        null=True,
        on_delete=models.PROTECT,
        related_name="timeseries",
    )
    range_gte = models.DecimalField(
        max_digits=16,
        decimal_places=8,
        blank=True,
        null=True,
    )
    range_gt = models.DecimalField(
        max_digits=16,
        decimal_places=8,
        blank=True,
        null=True,
    )
    range_lte = models.DecimalField(
        max_digits=16,
        decimal_places=8,
        blank=True,
        null=True,
    )
    range_lt = models.DecimalField(
        max_digits=16,
        decimal_places=8,
        blank=True,
        null=True,
    )

    def __str__(self):
        return self.canonical_name

    class Meta:
        ordering = ["canonical_name"]
        verbose_name_plural = "timeseries"

    @injectable_property
    def highlighted_timeseries(self):
        return self.inputs.filter(highlight=True)

    @injectable_property
    def active_acquired_protocols(self):
        return self.acquired_protocols.filter(active=True)

    @property
    def active_frequencies(self):
        protocols = set(ap.protocol_id for ap in self.active_acquired_protocols)
        return [
            freq
            for freq in self.frequencies.all()
            if (protocols and freq.protocol_id in protocols) or (not protocols and freq.protocol_id is None)
        ]

    @injectable_property
    def active_thresholds(self):
        return self.thresholds.filter(active=True)

    def unfiltered_events_search(self, desc=True):
        return (
            elastic.Search().filter_by_name(self.canonical_name).sort(
                "-@timestamp" if desc else "@timestamp",
                "coords.x",
                "coords.y",
                "coords.z"
            )
        )

    def events_search(self, desc=True, date_from=None, date_to=None):
        search = self.unfiltered_events_search(desc=desc)
        if self.range_gte is not None:
            search = search.filter_by_value_range("gte", self.range_gte)
        if self.range_gt is not None:
            search = search.filter_by_value_range("gt", self.range_gt)
        if self.range_lte is not None:
            search = search.filter_by_value_range("lte", self.range_lte)
        if self.range_lte is not None:
            search = search.filter_by_value_range("lt", self.range_lt)
        if date_from:
            validate_timestamp(date_from, "date_from")
            search = search.filter_by_timestamp_range("gte", date_from)
        if date_to:
            validate_timestamp(date_to, "date_to")
            search = search.filter_by_timestamp_range("lt", date_to)
        return search

    def get_events(self, from_, size, desc=True, **filters):
        if size <= 0:
            return []
        return elastic.search(self.events_search(desc=desc, **filters)[from_:(from_ + size)]).hits

    def get_events_aggregation(
            self, aggregation_type,
            interval=None, intervals=None, timezone_offset=None, raise_exception=False,
            **filters
    ):
        search = self.events_search(**filters)
        ret = elastic.get_timeseries_aggregation(
            search,
            aggregation_type,
            interval=interval,
            intervals=intervals,
            timezone_offset=timezone_offset,
        )
        if ret is None and raise_exception:
            raise ValidationError('Unknown aggregation type')
        return ret

    def get_head(self, **filters):
        search = self.events_search(**filters)
        survey = elastic.search(search[0:1])
        if survey.count == 0 or not survey.hits:
            return []
        return list(elastic.scan(
            search.filter_by_timestamp_range("gte", survey.hits[0]["@timestamp"])
        ))

    def get_event_stream(self, page_size=200, **filters):
        return elastic.scan(self.events_search(**filters)[:page_size])

    @injectable_property
    def events(self):
        return self.get_events(0, 10)

    @injectable_property
    def all_events(self):
        """Used as a means of differentiating sets of events from the 'events'
        injectable property. If not injected, it will have the same
        default as 'events'.

        """
        return self.get_events(0, 10)

    def as_event(self, value, timestamp=None, labels=None, coords=None, _id=None):
        def dedup(kvs):
            keys = set()
            for kv in reversed(kvs):
                if kv["key"] not in keys:
                    yield kv
                    keys.add(kv["key"])

        return {
            **({"_id": _id} if _id is not None else {}),
            "@timestamp": timestamp if timestamp is not None else datetime.datetime.now().isoformat(),
            "name": self.canonical_name,
            "value": value,
            **({"coords": coords} if coords is not None else {}),
            "labels": list(dedup([
                *self.labels,
                {"key": "type", "value": self.type},
                {"key": "backend-version", "value": settings.COMMIT or "unknown"},
                {"key": "namespace", "value": settings.NAMESPACE},
                *(labels or []),
            ])),
        }

    def get_absolute_url(self):
        if self.template_name is None:
            return None
        return reverse(
            "v1:template-graph",
            args=[self.template_name],
        )


@reversion.register()
class MeasurementProtocol(models.Model):
    id = models.SlugField(max_length=255, primary_key=True)
    description = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return self.id

    class Meta:
        ordering = ["id"]


@reversion.register(follow=("timeseries",))
class AcquiredProtocol(models.Model):
    id = AutoUUIDField()
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    timeseries = models.ForeignKey(
        Timeseries,
        on_delete=models.CASCADE,
        related_name="acquired_protocols",
    )
    protocol = models.ForeignKey(
        MeasurementProtocol,
        on_delete=models.PROTECT,
        related_name="acquisitions",
    )
    active = models.BooleanField(default=True)
    meta = JSONField(default=dict, editable=False, blank=True, null=True)

    def save(self, *args, **kwargs):
        with transaction.atomic():
            if self.pk is None and (self.active is None or self.active is True):
                AcquiredProtocol.objects.filter(
                    timeseries=self.timeseries
                ).update(active=False)
            return super().save(*args, **kwargs)

    class Meta:
        ordering = ["-created_at"]


@reversion.register()
class Threshold(models.Model):
    id = AutoUUIDField()
    created_at = models.DateTimeField(
        auto_now_add=True,
        db_index=True,
    )
    timeseries = models.ForeignKey(
        Timeseries,
        on_delete=models.CASCADE,
        related_name="thresholds",
    )
    active = models.BooleanField(default=True)
    lower = models.DecimalField(
        max_digits=16,
        decimal_places=8,
        blank=True,
        null=True,
    )
    upper = models.DecimalField(
        max_digits=16,
        decimal_places=8,
        blank=True,
        null=True,
    )
    kind = models.SlugField(max_length=255, blank=True, null=True)

    def __str__(self):
        return "".join((
            f"{self.lower}" if self.lower is not None else "?",
            " -- ",
            f"{self.upper}" if self.upper is not None else "?",
            f" ({self.kind})" if self.kind else "",
            " (INACTIVE)" if not self.active else "",
        ))

    class Meta:
        ordering = ["-created_at"]


@reversion.register()
class Frequency(models.Model):
    id = AutoUUIDField()
    created_at = models.DateTimeField(
        auto_now_add=True,
        db_index=True,
    )
    timeseries = models.ForeignKey(
        Timeseries,
        on_delete=models.CASCADE,
        related_name="frequencies",
    )
    protocol = models.ForeignKey(
        MeasurementProtocol,
        blank=True,
        null=True,
        on_delete=models.CASCADE,
        related_name="frequencies",
    )
    minutes = models.DecimalField(
        max_digits=16,
        decimal_places=8,
    )
    tolerance_lower = models.DecimalField(
        max_digits=16,
        decimal_places=8,
        blank=True,
        null=True,
    )
    tolerance_upper = models.DecimalField(
        max_digits=16,
        decimal_places=8,
        blank=True,
        null=True,
    )

    class Meta:
        ordering = ["-created_at"]
        verbose_name_plural = "frequencies"
