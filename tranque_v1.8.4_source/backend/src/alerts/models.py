import logging
from functools import partial

from django.conf import settings
from django.contrib.gis.db import models
from django.contrib.postgres.fields import JSONField
from django.core.exceptions import ImproperlyConfigured
from django.utils import timezone
from django.utils.functional import cached_property

from alerts.modules import base_states
from alerts.modules.base_states import ALERT_STATES, CLOSED
from api.v1.serializers.user_serializers import serialize_author
from base.fields import AutoUUIDField
from base.fields import ValidatedJSONField
from documents.models import Document
from remotes.dispatch import send_simple_message
from remotes.models import current_namespace

logger = logging.getLogger(__name__)


class Ticket(models.Model):
    RESULT_STATE_SCHEMA = {
        "type": "object",
        "properties": {
            "level": {"type": "number", "minimum": -1},
            "short_message": {"type": "string"},
            "message": {"type": "string"},
        },
        "required": ["level", "short_message"],
    }

    class TicketLevel:
        NO_LEVEL = base_states.NO_LEVEL

    empty_result_state = {
        'level': TicketLevel.NO_LEVEL,
        'short_message': 'no message'
    }

    CONDITIONS_SCHEMA = {
        "type": "array",
        "items": {
            "type": "object",
            "properties": {
                "description": {"type": "string"},
                "complete": {"type": "boolean"}
            },
            "required": ["description", "complete"]
        }
    }

    # A property is the target state to escalate to.
    # For example, "STATE_1" means "Conditions to escalate to STATE_1"
    ESCALATE_CONDITIONS_SCHEMA = {
        "type": "object",
        "additionalProperties": CONDITIONS_SCHEMA
    }

    class TicketState:
        CLOSED = base_states.CLOSED

    id = AutoUUIDField()
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True, db_index=True)
    module = models.CharField(max_length=510, db_index=True, null=False, blank=False)
    state = models.CharField(
        max_length=510,
        db_index=True,
        null=False,
        blank=False,
    )
    result_state = ValidatedJSONField(
        schema=RESULT_STATE_SCHEMA,
        default=partial(dict, **empty_result_state),
    )
    public_alert_abstract = models.CharField(max_length=510, default='')
    target = models.ForeignKey(
        "targets.Target",
        on_delete=models.CASCADE,
        related_name="tickets",
        blank=False,
        null=False,
    )
    # A serialized spread object representation
    spread_object = JSONField(blank=True, null=True)
    children = models.ManyToManyField(
        "self",
        blank=True,
        symmetrical=False,
        related_name="parents",
    )
    archived = models.BooleanField(default=False)
    evaluable = models.BooleanField(default=True)
    # a slash-delimited string of groups inherited from the controller
    # e.g. /emac/emac.ir/emac.public/
    # note the leading and trailing slashes, needed for predictable matching
    groups = models.CharField(max_length=510, db_index=True)
    close_conditions = ValidatedJSONField(schema=CONDITIONS_SCHEMA, default=list)
    archive_conditions = ValidatedJSONField(schema=CONDITIONS_SCHEMA, default=list)
    escalate_conditions = ValidatedJSONField(schema=ESCALATE_CONDITIONS_SCHEMA, default=dict)
    # once a ticket is propagated, it can't stop being propagated
    propagated = models.BooleanField(default=False)
    origin = models.CharField(max_length=255, default=current_namespace, editable=False)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self):
        return f'{self.id} ({self.module}, {self.state})'

    @cached_property
    def base_module(self):
        from alerts.collector import target_controllers
        return target_controllers.get_base_name(self.module)

    @property
    def state_group(self):
        if self.state == CLOSED:
            return CLOSED
        elif self.state in ALERT_STATES:
            return self.state
        else:
            return self.state[0]

    @cached_property
    def base_controller(self):
        from alerts.collector import target_controllers
        return target_controllers.get_base_controller(self.module)

    def archive(self, archived, author=None, description=None):
        if self.archived == archived:
            return self
        self.archived = archived
        self.save()
        log = TicketLog.archived_change(
            archived,
            author=author,
            meta={} if description is None else {"description": description},
        )
        log.ticket = self
        log.save()
        return self

    def set_evaluable(self, evaluable):
        if self.evaluable == evaluable:
            return self
        self.evaluable = evaluable
        self.save()
        log = TicketLog.evaluable_change(evaluable)
        log.ticket = self
        log.save()
        return self

    def get_document_folder(self, *suffixes):
        return self.target.get_document_folder('ticket', self.id, *suffixes)


class TicketLog(models.Model):
    META_SCHEMA = {
        "type": "object",
        "properties": {
            # state transition
            "previous_state": {"oneOf": [{"type": "string"}, {"type": "null"}]},
            "next_state": {"type": "string"},
            # archived transition
            "previous_archived": {"type": "boolean"},
            "next_archived": {"type": "boolean"},
            # evaluability transition
            "previous_evaluable": {"type": "boolean"},
            "next_evaluable": {"type": "boolean"},
            # event data
            "description": {"type": "string"},
            # message
            "message": {"type": "string"},
        },
    }

    TIMESERIES_SCHEMA = {
        "type": "array",
        "items": {
            "type": "object",
            "properties": {
                "canonical_name": {"type": "string"},
                "events": {
                    "type": "array",
                    "items": {
                        "type": "string"  # events is a list of ids
                    }
                },
            },
            "required": ["canonical_name", "events"],
        },
    }

    # List of documents to be saved to the log
    _documents = []

    id = AutoUUIDField()
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    highlight = models.BooleanField(default=False, db_index=True, null=False)
    ticket = models.ForeignKey(
        Ticket,
        on_delete=models.CASCADE,
        related_name="logs",
        null=False,
        blank=False,
    )
    documents = models.ManyToManyField(
        Document,
        related_name="+",
        blank=True,
    )
    # A serialized user representation
    author = JSONField(blank=True, null=True)
    # A serialized timeseries representation, with a reference of events ids
    # Only the timeseries are serialized because timeseries configuration may change over time
    timeseries = ValidatedJSONField(schema=TIMESERIES_SCHEMA, default=list)
    meta = ValidatedJSONField(schema=META_SCHEMA, default=dict)
    origin = models.CharField(max_length=255, default=current_namespace, editable=False)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if self._documents:
            self.documents.set(self._documents)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f'{self.id} (ticket:{self.ticket.id})'

    @classmethod
    def state_transition(cls, ticket, state):
        source = ticket.state if ticket is not None else None
        if source == state:
            return {}
        return {
            "previous_state": source,
            "next_state": state
        }

    @classmethod
    def archived_change(cls, archived, author=None, meta=None):
        return cls(
            author=serialize_author(author),
            meta={**(meta or {}), "previous_archived": not archived, "next_archived": archived},
        )

    @classmethod
    def evaluable_change(cls, evaluable):
        return cls(
            meta={"description": "evaluable", "previous_evaluable": not evaluable, "next_evaluable": evaluable},
        )

    @classmethod
    def new_request_entry(cls, ticket, author=None, authorization_string=None):
        return cls(
            ticket=ticket,
            author=serialize_author(author),
            meta={"description": "request", "authorization": authorization_string},
        )

    @classmethod
    def new_authorization_entry(cls, ticket, author=None, authorization_request=None, new_status=None):
        return cls(
            ticket=ticket,
            author=serialize_author(author),
            meta={
                "description": "authorization",
                "authorization": authorization_request.authorization,
                "comment": authorization_request.comment,
                "status": new_status
            },
        )

    @classmethod
    def new_comment_entry(cls, ticket, author=None, meta=None):
        return cls(
            ticket=ticket,
            author=serialize_author(author),
            meta={**(meta or {})},
        )

    @classmethod
    def merge(cls, ticket, changes):
        return cls.objects.create(
            # merge is only done by system when sending updates between servers
            ticket=ticket,
            author={'system': settings.NAMESPACE},
            meta={'changes': changes},
        )


class Broadcast(models.Model):
    HANDLERS_SCHEMA = {
        "type": "array",
        "items": {
            "type": "object",
            "properties": {
                "name": {"type": "string"},
            },
        },
    }

    id = AutoUUIDField()
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    broadcasted_at = models.DateTimeField(null=True, db_index=True, editable=False)
    ticket = models.ForeignKey(
        Ticket,
        on_delete=models.CASCADE,
        related_name="broadcasts",
        null=False,
        blank=False,
    )
    handlers = ValidatedJSONField(schema=HANDLERS_SCHEMA, default=list)
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="+",
        blank=True,
        null=True,
    )

    class Meta:
        ordering = ["-created_at"]


class UserIntent(models.Model):
    CONTENT_SCHEMA = {
        "type": "object",
        "properties": {
            "state": {"type": "string"},
            "document": {"oneOf": [{"type": "string"}, {"type": "null"}]},
            "archived": {"type": "boolean"}
        },
        "required": []
    }

    class IssueOptions:
        NO_ISSUE = ""
        INSUFFICIENT_PERMISSIONS = "insufficient-permissions"
        AUTHORIZATION_REQUIRED = "authorization-required"
        INSUFFICIENT_INFORMATION = "insufficient-information"
        BLOCKED_BY_RULES = "blocked-by-rules"
        UNMET_CONDITIONS = "unmet-conditions"
        ENGINE_ERROR = "system-engine-error"
        HANDLER_ERROR = "system-handler-error"
        choices = (
            (NO_ISSUE, "no hay problemas"),
            (INSUFFICIENT_PERMISSIONS, "el usuario no tiene permisos suficientes"),
            (AUTHORIZATION_REQUIRED, "se requiere authorizacion para realizar esta acción"),
            (INSUFFICIENT_INFORMATION, "faltan antecedentes"),
            (BLOCKED_BY_RULES, "bloqueado por reglas del sistema"),
            (ENGINE_ERROR, "error del sistema durante la ejecución"),
            (HANDLER_ERROR, "error del mensaje al servidor"),
        )

    id = AutoUUIDField()
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="+",
        blank=False,
        null=False,
    )
    serialized_user = JSONField(blank=True, null=True)
    target = models.ForeignKey(
        "targets.Target",
        on_delete=models.CASCADE,
        related_name="user_intents",
        blank=False,
        null=False,
    )
    module = models.CharField(max_length=510, db_index=True, null=False, blank=False)
    content = ValidatedJSONField(schema=CONTENT_SCHEMA, default=dict)
    origin = models.CharField(max_length=255, default=current_namespace, editable=False)
    attended_by_destination_at = models.DateTimeField(blank=True, null=True)
    sent_to_destination_at = models.DateTimeField(blank=True, null=True)
    # attended_at is None == unattended
    attended_at = models.DateTimeField(null=True, db_index=True)
    issue = models.CharField(
        max_length=255,
        null=False,
        blank=True,
        choices=IssueOptions.choices,
        default=IssueOptions.NO_ISSUE,
    )

    class Meta:
        ordering = ["-created_at"]

    @cached_property
    def document(self):
        return Document.objects.filter(pk=self.content.get("document")).first()

    @cached_property
    def user_is_authority(self):
        return self.user.groups.filter(name=settings.AUTHORITY_GROUP).exists()

    @cached_property
    def user_is_mine(self):
        return self.user.groups.filter(name=settings.MINE_GROUP).exists()

    def attempts_closing(self):
        return self.content.get("state", None) == Ticket.TicketState.CLOSED

    def attempts_archive_update(self, archived):
        update = self.content.get("archived")
        return update is not None and update == archived

    def attempts_state_update(self, current_state):
        state = self.content.get("state", None)
        return state is not None and state != Ticket.TicketState.CLOSED and state != current_state

    def setissue(self, issue_option):
        _option = str(issue_option)
        assert _option.isupper() and hasattr(self.IssueOptions, _option), f"invalid issue {_option}"
        self.issue = getattr(self.IssueOptions, _option)

    def as_log(self, **kwargs):
        log = TicketLog(**{
            **kwargs,
            "author": serialize_author(self.user),
        })
        log._documents = [self.document] if self.document else []
        return log

    def send_to_origin(self):
        self.attended_at = timezone.now()
        self.sent_to_destination_at = timezone.now()
        self.save()
        if settings.STACK_IS_SML:
            args = {
                'exchange': settings.SMC_AMQP_EXCHANGE,
                'broker_url': settings.SMC_BROKER_URL
            }
        elif self.target.remote is not None:
            args = {'exchange': self.target.remote.exchange}
        else:
            raise ImproperlyConfigured('stack is SMC, but no remote found')
        send_simple_message(command='alerts.ticket.intent', body={
            "id": self.id,
            "module": self.module,
            "target__canonical_name": self.target.canonical_name,
            "content": self.content,
            "serialized_user": self.serialized_user
        }, **args)


class AuthorizationRequest(models.Model):
    class Status:
        PENDING = 'pending'
        APPROVED = 'approved'
        APPROVED_AND_USED = 'approved_and_used'
        DENIED = 'denied'
        choices = (
            (PENDING, "en espera"),
            (APPROVED, "aprobada"),
            (APPROVED_AND_USED, "usada"),
            (DENIED, "denegada"),
        )

    id = AutoUUIDField()
    ticket = models.ForeignKey(
        "Ticket",
        on_delete=models.CASCADE,
        related_name="authorizations",
        blank=False,
        null=False,
    )
    authorization = models.CharField(max_length=512, null=False, blank=False)
    # A serialized requesting user representation
    created_by = JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    origin = models.CharField(max_length=255, default=current_namespace, editable=False)
    # set when it is received by an SMC for approval
    received_at = models.DateTimeField(blank=True, null=True)
    # A serialized resolving user representation
    resolved_by = JSONField(blank=True, null=True)
    resolved_at = models.DateTimeField(blank=True, null=True)
    comment = models.TextField(blank=True, null=True)
    documents = models.ManyToManyField('documents.Document', related_name='+', blank=True)
    status = models.CharField(
        max_length=20,
        null=False,
        blank=False,
        choices=Status.choices,
        default=Status.PENDING,
    )

    class Meta:
        ordering = ["-created_at"]

    def as_log(self, **kwargs):
        log = TicketLog(**{
            **kwargs,
            "author": serialize_author(self.user),
        })
        log._documents = [self.document] if self.document else []
        return log


class AttendedEvent(models.Model):
    """Used to keep a temporary ledger of timeseries events already
    considered.

    """

    module = models.CharField(max_length=510, null=False, blank=False, db_index=True)
    event_id = models.CharField(max_length=510, null=False, blank=False)
    event_version = models.IntegerField(null=False)
    target = models.ForeignKey(
        "targets.Target",
        related_name="+",
        on_delete=models.CASCADE,
        null=False,
        blank=False,
    )


class ContributingDocument(models.Model):
    """Used to concentrate documents linked to ticket management on
    specific targets."""
    id = AutoUUIDField()
    target = models.ForeignKey(
        'targets.Target',
        related_name="contributing_documents",
        on_delete=models.CASCADE,
        null=True,
        blank=False,
    )
    document = models.ForeignKey(
        Document,
        related_name="contributions",
        on_delete=models.CASCADE,
        null=False,
        blank=False,
    )
    module = models.CharField(max_length=510, db_index=True, null=False, blank=False)

    class Meta:
        ordering = ["-id"]


class TicketComment(models.Model):
    class CommentType:
        EVENT_MANAGEMENT = "event_management"
        ALERT_MANAGEMENT = "alert_management"
        ALERT_COMPLEMENTARY = "alert_complementary"
        CLOSE_REPORT = "close_report"
        choices = (
            (EVENT_MANAGEMENT, "Ticket management report"),
            (ALERT_COMPLEMENTARY, "Complementary information to enrich alert message in public site"),
            (ALERT_MANAGEMENT, "Alert management report"),
            (CLOSE_REPORT, "Close report")
        )

    id = AutoUUIDField()
    ticket = models.ForeignKey(
        'Ticket',
        on_delete=models.CASCADE,
        related_name='comments',
        editable=False,
    )
    comment_type = models.CharField(max_length=25, choices=CommentType.choices, blank=False)
    content = models.TextField(blank=True)
    created_by = JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    origin = models.CharField(max_length=255, default=current_namespace, editable=False)
    updated_at = models.DateTimeField(auto_now=True)

    documents = models.ManyToManyField(
        Document,
        related_name='+',
        blank=True,
    )

    class Meta:
        ordering = ["updated_at"]

    def __str__(self):
        return f'{self.id} (ticket:{self.ticket.id}, {self.comment_type})'


class PublicAlertMessage(models.Model):
    class AlertType:
        YELLOW_ALERT = "YELLOW"
        RED_ALERT = "RED"
        NO_ALERT = "GREEN"
        DISCONNECTED_ALERT = "GRAY"
        choices = (
            (YELLOW_ALERT, "Public yellow alert message"),
            (RED_ALERT, "Public red alert message"),
            (NO_ALERT, "Public message with no alerts"),
            (DISCONNECTED_ALERT, "Public disconnected alert message")
        )

    class ScopeType:
        EF = 'ef'
        EMAC = 'emac'
        choices = [
            (EF, 'ef'),
            (EMAC, 'emac')
        ]

    id = AutoUUIDField()
    target = models.ForeignKey(
        "targets.Target",
        on_delete=models.CASCADE,
        related_name="alert_messages",
        blank=False,
        null=False,
    )
    scope = models.CharField(max_length=5, choices=ScopeType.choices, default=ScopeType.EF, blank=False)
    alert_type = models.CharField(max_length=25, choices=AlertType.choices, blank=False)
    content = models.TextField(blank=True)
    created_by = JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-created_at"]


class AlertDisconnection(models.Model):

    class ScopeType:
        EF = 'ef'
        EMAC = 'emac'
        choices = [
            (EF, 'ef'),
            (EMAC, 'emac')
        ]

    id = AutoUUIDField()
    created_at = models.DateTimeField(default=timezone.now)
    # created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='+')
    created_by = JSONField(default=dict)

    target = models.ForeignKey(
        "targets.Target",
        on_delete=models.CASCADE,
        related_name="alert_disconnections",
        blank=False,
        null=False,
    )

    scope = models.CharField(max_length=5, choices=ScopeType.choices, default=ScopeType.EF, blank=False)

    closed = models.BooleanField(default=False)
    closed_at = models.DateTimeField(blank=True, null=True)

    comment = models.TextField(blank=True, null=True)

    documents = models.ManyToManyField(
        Document,
        related_name='+',
        blank=True,
    )

    class Meta:
        ordering = ["created_at"]


class ManualAlertLog(models.Model):

    class ScopeType:
        EF = 'ef'
        EMAC = 'emac'
        choices = [
            (EF, 'ef'),
            (EMAC, 'emac')
        ]

    id = AutoUUIDField()
    created_at = models.DateTimeField(default=timezone.now)
    # created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='+')
    created_by = JSONField(default=dict)

    target = models.ForeignKey(
        "targets.Target",
        on_delete=models.CASCADE,
        related_name="manual_alerts",
        blank=False,
        null=False,
    )

    ticket = models.ForeignKey(
        Ticket,
        on_delete=models.CASCADE,
        related_name='manual_alert_log',
        null=False,
        blank=False,
    )

    scope = models.CharField(max_length=5, choices=ScopeType.choices, default=ScopeType.EF, blank=False)

    comment = models.TextField(blank=True, null=True)

    documents = models.ManyToManyField(
        Document,
        related_name='+',
        blank=True,
    )

    class Meta:
        ordering = ["created_at"]
