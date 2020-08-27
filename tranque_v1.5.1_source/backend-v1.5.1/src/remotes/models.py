import logging

import boto3
import reversion
from botocore.exceptions import ClientError
from django.conf import settings
from django.contrib.gis.db import models
from django.contrib.postgres.fields import JSONField
from django.utils import timezone

from base.fields import AutoUUIDField
from base.fields import ValidatedJSONField

logger = logging.getLogger(__name__)


def get_s3_client():
    """S3 client promise.

    """
    return boto3.client(
        "s3",
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        endpoint_url=settings.AWS_S3_ENDPOINT_URL,
    )


@reversion.register()
class Remote(models.Model):
    """A weak reference to a remote installation.

    """

    id = AutoUUIDField()
    namespace = models.CharField(max_length=255, unique=True)
    exchange = models.CharField(max_length=255, unique=True)
    bucket = models.CharField(max_length=255, unique=True)
    last_seen = models.DateTimeField(blank=True, null=True)

    class Meta:
        ordering = ["id"]

    def __str__(self):
        return " ".join([
            self.namespace,
            *(["(current)"] if self.is_current else []),
        ])

    @property
    def is_current(self):
        return (
                self.namespace == settings.NAMESPACE and
                self.exchange == settings.AMQP_FEDERATED_EXCHANGE and
                self.bucket == settings.AWS_STORAGE_BUCKET_NAME
        )

    def has_bucket(self):
        if not settings.STORAGE_IS_S3:
            return False
        try:
            s3_client = get_s3_client()
            return self.bucket in set(
                bucket["Name"]
                for bucket in s3_client.list_buckets()["Buckets"]
            )
        except Exception:
            return False

    def create_bucket(self):
        if not settings.STORAGE_IS_S3:
            logging.info(f"Can't create bucket because storage backend is not S3: {settings.DEFAULT_FILE_STORAGE}")
            return False
        try:
            s3_client = get_s3_client()
            s3_client.create_bucket(Bucket=self.bucket)
            logger.info(f"Created bucket '{self.bucket}' in S3 backend")
            return True
        except ClientError as e:
            if e.response["Error"]["Code"] == "BucketAlreadyOwnedByYou":
                logger.info(f"Bucket '{self.bucket}' already exists in S3 backend")
                return True
            else:
                logger.error(f"Couldn't create bucket '{self.bucket}' in S3 backend")
                return False
        except Exception:
            logger.error(f"Couldn't create bucket '{self.bucket}' in S3 backend")
            return False

    @staticmethod
    def create_current():
        if settings.AWS_STORAGE_BUCKET_NAME is None:
            return None
        r, _ = Remote.objects.update_or_create(
            namespace=settings.NAMESPACE,
            defaults={
                "exchange": settings.AMQP_FEDERATED_EXCHANGE,
                "bucket": settings.AWS_STORAGE_BUCKET_NAME,
            },
        )
        return r


def current_namespace():
    return settings.NAMESPACE


class Message(models.Model):
    """A message sent or received via the amqp broker. May be paired with
    another message indicating a request-response pair. The model also
    supports many requests paired with many responses, because of the
    many-to-many relationship used.

    """

    id = AutoUUIDField()
    response = models.ManyToManyField(
        "self",
        related_name="request",
        symmetrical=False,
    )
    command = models.CharField(max_length=510, db_index=True)
    body = JSONField(default=dict)
    exchange = models.CharField(max_length=510, db_index=True)
    origin = models.CharField(
        max_length=255,
        db_index=True,
        default=current_namespace,
    )
    created_at = models.DateTimeField(default=timezone.now, db_index=True)

    class Meta:
        ordering = ["-created_at", "id"]

    def __str__(self):
        return f"{self.exchange}: '{self.command}' from {self.origin}"

    def make_response(self, **kwargs):
        """Returns a new message that is a response to this message.

        """
        message = Message.objects.create(**{
            "command": self.command,
            "body": self.body,
            "exchange": self.exchange,
            **kwargs
        })
        self.response.add(message)
        return message

    @property
    def remote(self):
        return Remote.objects.filter(namespace=self.origin).first()

    @property
    def is_foreign(self):
        return self.origin != settings.NAMESPACE

    @property
    def has_response(self):
        return self.response.exists()

    @property
    def is_response(self):
        return self.request.exists()


class DataRequestState:
    WAITING_RESPONSE = 'waiting_response'
    RECEIVED = 'received'

    STATE_TYPES = (
        (WAITING_RESPONSE, 'Waiting Response'),
        (RECEIVED, 'Received'),
    )


class EventTraceRequest(models.Model):
    id = AutoUUIDField()
    event_id = models.CharField(max_length=510, db_index=True)
    timeseries = models.ForeignKey('targets.Timeseries', on_delete=models.PROTECT, related_name="+")
    state = models.CharField(max_length=20, choices=DataRequestState.STATE_TYPES,
                             default=DataRequestState.WAITING_RESPONSE)
    created_at = models.DateTimeField(default=timezone.now)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='+')
    received_at = models.DateTimeField(blank=True, null=True)

    def get_message_args(self):
        if self.timeseries.target.remote is not None:
            exchange = self.timeseries.target.remote.exchange
        else:
            exchange = None
        body = {
            "event_id": self.event_id,
            "request_id": self.id,
            "timeseries_canonical_name": self.timeseries.canonical_name
        }
        return {'command': 'remote.event.trace.request', 'body': body, 'exchange': exchange}


class DataDumpRequest(models.Model):
    id = AutoUUIDField()
    target = models.ForeignKey('targets.Target', on_delete=models.PROTECT, related_name="+")
    profile = models.CharField(max_length=20)
    date_from = models.DateTimeField()
    date_to = models.DateTimeField()
    state = models.CharField(max_length=20, choices=DataRequestState.STATE_TYPES,
                             default=DataRequestState.WAITING_RESPONSE)
    created_at = models.DateTimeField(default=timezone.now)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='+')
    received_at = models.DateTimeField(blank=True, null=True)
    events_file = models.FileField(upload_to='dumps/', max_length=1020, null=True, blank=True)
    timeseries_file = models.FileField(upload_to='dumps/', max_length=1020, null=True, blank=True)
    sources_file = models.FileField(upload_to='dumps/', max_length=1020, null=True, blank=True)
    groups_file = models.FileField(upload_to='dumps/', max_length=1020, null=True, blank=True)

    def get_message_args(self):
        if self.target.remote is not None:
            exchange = self.target.remote.exchange
        else:
            exchange = None
        body = {
            "target": self.target.canonical_name,
            "profile": self.profile,
            "date_from": self.date_from.isoformat() if self.date_from is not None else None,
            "date_to": self.date_to.isoformat() if self.date_to is not None else None,
            "request_id": self.id,
        }
        return {'command': 'remote.target.data.dump.request', 'body': body, 'exchange': exchange}


class VersionHash(models.Model):
    MANIFESTS_SCHEMA = {
        "type": "array",
        "items": {"type": "string", "minLength": 1}
    }

    HASHES_SCHEMA = {
        "type": "array",
        "items": {"type": "array", "minLength": 1}
    }

    id = AutoUUIDField()
    remote = models.ForeignKey(Remote, on_delete=models.CASCADE)
    created_at = models.DateTimeField(default=timezone.now, db_index=True)
    manifest_versions = ValidatedJSONField(schema=MANIFESTS_SCHEMA, default=list)
    hashes_set = ValidatedJSONField(schema=HASHES_SCHEMA, default=list)
    is_valid_set = ValidatedJSONField(schema=HASHES_SCHEMA, default=list)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"""{self.remote.namespace}<->
                {self.id}"""

    def remote_str_namespace(self):
        return f'{self.remote.namespace}'
