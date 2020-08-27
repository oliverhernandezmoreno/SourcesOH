from collections import OrderedDict
import datetime
import importlib

from django.conf import settings
from django.contrib.gis.db import models
from django.contrib.postgres.fields import JSONField
from django.db.models.signals import pre_save, post_delete
from django.dispatch import receiver
import pytz

from base.fields import AutoUUIDField
from base.fields import ValidatedJSONField
from base.serializers import freeze
from base.signals import delete_field_file
from etl.exceptions import ETLError
from targets import elastic
from targets.graphs import build_flat_graph
from targets.models import Target
from targets.models import Timeseries


class DataFile(models.Model):

    id = AutoUUIDField()
    file = models.FileField(upload_to="data-files/%Y.%m/", max_length=1020)
    filename = models.CharField(max_length=255)
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="+",
        blank=True,
        null=True,
    )
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-created_at"]


@receiver(post_delete, sender=DataFile)
def delete_file(sender, instance, *args, **kwargs):
    if instance.file is not None:
        delete_field_file(instance.file)


def import_executor(name):
    if ".." in name:
        raise ETLError(f"non existent executor {name}")
    try:
        # Executor names may come with a 'flavour', a differencing
        # term used to distinguish them. The flavour is just the
        # substring after a colon (':') and doesn't impact the ETL
        # pipeline.
        package_name, *flavour = name.split(":", 1)
        executor_module = importlib.import_module(f"etl.executors.{package_name}")
    except ImportError:
        raise ETLError(f"non existent executor {name}")
    if not hasattr(executor_module, "Pipeline"):
        raise ETLError(f"non existent executor {name}")
    return executor_module.Pipeline(name)


class ETLOperation(models.Model):

    class ETLState:
        EXTRACT = "extract"
        CLEAN = "clean"
        CONFORM = "conform"
        DELIVER = "deliver"
        SUCCESS = "success"
        choices = (
            (EXTRACT, "Extraction phase"),
            (CLEAN, "Clean phase"),
            (CONFORM, "Conform phase"),
            (DELIVER, "Deliver phase"),
            (SUCCESS, "Successful"),
        )

    ERRORS_SCHEMA = {
        "type": "array",
        "items": {
            "type": "object",
            "properties": {
                "code": {"type": "string"},
                "message": {"type": "string"},
                "sheet_number": {"type": "number"},
                "sheet_name": {"type": "string"},
                "linenumber": {"type": "number"},
            },
            "required": ["code", "message"],
        },
    }

    id = AutoUUIDField()
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="+",
        blank=True,
        null=True,
    )
    target = models.ForeignKey(
        Target,
        on_delete=models.CASCADE,
    )
    data_file = models.ForeignKey(
        DataFile,
        on_delete=models.SET_NULL,
        related_name="etl_operations",
        blank=True,
        null=True,
    )
    started = models.DateTimeField(auto_now_add=True, db_index=True)
    changed_state = models.DateTimeField(auto_now=True, db_index=True)
    state = models.CharField(
        max_length=127,
        choices=ETLState.choices,
        default=ETLState.EXTRACT,
        db_index=True,
    )
    finished = models.BooleanField(default=False)
    errors = ValidatedJSONField(schema=ERRORS_SCHEMA, blank=True, null=True, default=list)
    executor = models.CharField(max_length=127, db_index=True)
    initial_context = ValidatedJSONField(schema={"type": "object"}, blank=True, null=True, default=dict)

    @property
    def deliverable(self):
        return self.state == type(self).ETLState.CONFORM and \
            not self.finished and \
            not self.errors and \
            self.conformed_values.filter(series__isnull=True).count() == 0 and \
            self.conformed_values.count() > 0

    @classmethod
    def start(cls, executor, user, target, data_file, ctx):
        return import_executor(executor).start(
            user,
            target,
            data_file,
            ctx,
        )

    def deliver(self):
        if not self.deliverable:
            raise ETLError("operation is not deliverable")
        return import_executor(self.executor).deliver(self)

    def make_error(self, code, message, **kwargs):
        return {
            **kwargs,
            "code": code,
            "message": message,
        }

    def add_error(self, obj):
        # add the error to the tail
        errors = [
            *(self.errors or []),
            {k: v for k, v in obj.items() if v is not None},
        ]
        # deduplicate
        unique = OrderedDict((freeze(error), error) for error in errors)
        self.errors = [*unique.values()]

    def execution_plan(self):
        """Returns a list of lists of timeseries, each nested list
        representing a cycle of computation potentially triggered by
        this operation. The first nested list should match the
        timeseries referenced by this operation's conformed values.

        """
        return build_flat_graph(
            Timeseries.objects.filter(pk__in=self.conformed_values.values("series")),
            "derivations"
        )

    def execution_facts(self):
        """Returns a list of events that were computed by the message
        originated by this operation.

        """
        headsearch = elastic.Search().filter_by_etloperation(self.id)
        head = elastic.search(headsearch[:1])
        if not head.hits:
            return []
        message_id = next(
            (
                label["value"]
                for label in head.hits[0].get("labels", [])
                if label.get("key") == "message-id"
            ),
            None,
        )
        if not message_id:
            return elastic.search(headsearch[:head.count]).hits
        bodysearch = elastic.Search().filter_by_message(message_id)
        bodycount = elastic.search(bodysearch[:0]).count
        return elastic.search(bodysearch[:bodycount]).hits

    class Meta:
        ordering = ["-started"]


class ETLExtractedValue(models.Model):

    id = AutoUUIDField()
    operation = models.ForeignKey(
        ETLOperation,
        on_delete=models.CASCADE,
        related_name="extracted_values",
    )
    sheet_number = models.IntegerField()
    sheet_name = models.CharField(max_length=510, blank=True, null=True)
    linenumber = models.IntegerField()
    data = ValidatedJSONField(
        schema={
            "type": "array",
            "items": {
                "type": "object",
            },
        },
        default=list,
    )

    @classmethod
    def encode_cell(cls, cell):
        types = {
            datetime.datetime: "datetime",
            int: "number",
            float: "number",
            str: "string",
        }
        encoders = {
            datetime.datetime: lambda v: v.isoformat(),
        }
        return {
            "type": types.get(type(cell), "string"),
            "value": encoders.get(type(cell), lambda v: v)(cell),
        }

    def make_error(self, code, message, **kwargs):
        return {
            **kwargs,
            "code": code,
            "message": message,
            "sheet_number": self.sheet_number,
            "sheet_name": self.sheet_name,
            "linenumber": self.linenumber,
        }

    class Meta:
        ordering = ["operation", "sheet_number", "linenumber"]


class ETLCleanedValue(models.Model):

    id = AutoUUIDField()
    operation = models.ForeignKey(
        ETLOperation,
        on_delete=models.CASCADE,
        related_name="cleaned_values",
    )
    sheet_number = models.IntegerField()
    sheet_name = models.CharField(max_length=510, blank=True, null=True)
    linenumber = models.IntegerField()
    # data columns
    group = models.CharField(max_length=510, blank=True)
    source = models.CharField(max_length=510, blank=True)
    series = models.CharField(max_length=510, blank=True)
    value = models.DecimalField(
        max_digits=16,
        decimal_places=8,
        blank=True,
        null=True,
    )
    timestamp = models.DateTimeField(blank=True, null=True)
    x_coord = models.DecimalField(
        max_digits=16,
        decimal_places=8,
        blank=True,
        null=True,
    )
    y_coord = models.DecimalField(
        max_digits=16,
        decimal_places=8,
        blank=True,
        null=True,
    )
    z_coord = models.DecimalField(
        max_digits=16,
        decimal_places=8,
        blank=True,
        null=True,
    )
    sequence = models.IntegerField(blank=True, null=True)
    label = models.CharField(max_length=510, blank=True)
    meta = JSONField(default=dict, blank=True, null=True)

    def make_error(self, code, message, **kwargs):
        return {
            **kwargs,
            "code": code,
            "message": message,
            "sheet_number": self.sheet_number,
            "sheet_name": self.sheet_name,
            "linenumber": self.linenumber,
        }

    class Meta:
        ordering = ["operation", "sheet_number", "linenumber"]

    @classmethod
    def make_from_extracted(cls, extracted, **kwargs):
        return cls(
            operation=extracted.operation,
            sheet_number=extracted.sheet_number,
            sheet_name=extracted.sheet_name,
            linenumber=extracted.linenumber,
            **{
                **{
                    "group": "",
                    "source": "",
                    "series": "",
                    "value": None,
                    "timestamp": None,
                    "x_coord": None,
                    "y_coord": None,
                    "z_coord": None,
                    "sequence": None,
                    "label": "",
                    "meta": None,
                },
                **kwargs,
            },
        )

    @classmethod
    def create_from_extracted(cls, extracted, **kwargs):
        instance = cls.make_from_extracted(extracted, **kwargs)
        instance.save()
        return instance


@receiver(pre_save, sender=ETLCleanedValue)
def set_timezone(sender, instance, *args, **kwargs):
    if instance.timestamp is not None and \
       instance.timestamp.tzinfo is None:
        delta = (instance.operation.initial_context or {}).get("timezoneOffset", 0)
        if isinstance(delta, (int, float)):
            instance.timestamp = pytz.utc.localize(instance.timestamp) + datetime.timedelta(minutes=delta)


class ETLConformedValue(models.Model):

    id = AutoUUIDField()
    operation = models.ForeignKey(
        ETLOperation,
        on_delete=models.CASCADE,
        related_name="conformed_values",
    )
    sheet_number = models.IntegerField()
    sheet_name = models.CharField(max_length=510, blank=True, null=True)
    linenumber = models.IntegerField()
    # data colums
    series = models.ForeignKey(
        Timeseries,
        on_delete=models.SET_NULL,
        related_name="+",
        blank=True,
        null=True,
    )
    value = models.DecimalField(
        max_digits=16,
        decimal_places=8,
    )
    timestamp = models.DateTimeField()
    x_coord = models.DecimalField(
        max_digits=16,
        decimal_places=8,
        blank=True,
        null=True,
    )
    y_coord = models.DecimalField(
        max_digits=16,
        decimal_places=8,
        blank=True,
        null=True,
    )
    z_coord = models.DecimalField(
        max_digits=16,
        decimal_places=8,
        blank=True,
        null=True,
    )
    sequence = models.IntegerField(blank=True, null=True)
    label = models.CharField(max_length=510, blank=True)
    meta = JSONField(default=dict, blank=True, null=True)

    def as_event(self):
        return {
            "@timestamp": self.timestamp.isoformat(),
            "name": self.series.canonical_name,
            "coords": {
                **({"x": float(self.x_coord)} if self.x_coord is not None else {}),
                **({"y": float(self.y_coord)} if self.y_coord is not None else {}),
                **({"z": float(self.z_coord)} if self.z_coord is not None else {}),
            },
            "sequence": self.sequence,
            "value": float(self.value),
            "labels": [
                *(self.series.labels or []),
                {"key": "backend-version", "value": settings.COMMIT},
                {"key": "source", "value": f"etl.executors.{self.operation.executor}"},
                {"key": "operation-id", "value": self.operation.id},
                {"key": "enrichment-tag", "value": self.label},
            ],
            "meta": self.meta,
        }

    def make_error(self, code, message, **kwargs):
        return {
            **kwargs,
            "code": code,
            "message": message,
            "sheet_number": self.sheet_number,
            "sheet_name": self.sheet_name,
            "linenumber": self.linenumber,
        }

    class Meta:
        ordering = ["operation", "sheet_number", "linenumber"]

    @classmethod
    def make_from_cleaned(cls, cleaned, **kwargs):
        return cls(
            operation=cleaned.operation,
            sheet_number=cleaned.sheet_number,
            sheet_name=cleaned.sheet_name,
            linenumber=cleaned.linenumber,
            timestamp=cleaned.timestamp,
            value=cleaned.value,
            x_coord=cleaned.x_coord,
            y_coord=cleaned.y_coord,
            z_coord=cleaned.z_coord,
            sequence=cleaned.sequence,
            label=cleaned.label,
            meta=cleaned.meta,
            **{
                **{
                    "series": None,
                },
                **kwargs,
            },
        )

    @classmethod
    def create_from_cleaned(cls, cleaned, **kwargs):
        instance = cls.make_from_cleaned(cleaned, **kwargs)
        instance.save()
        return instance
