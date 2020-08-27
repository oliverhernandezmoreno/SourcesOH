import reversion
from django.conf import settings
from django.contrib.gis.db import models
from django.contrib.postgres.fields import JSONField
from django.core import validators
from django.core.exceptions import ValidationError
from django.utils.functional import cached_property

from base.fields import AutoUUIDField
from base.fields import ValidatedJSONField
from base.serializers import freeze
from reportforms.schema import (
    FORM_SCHEMA,
    get_default_form,
    get_schema_field_count,
    validate_answer_for_schema,
)


@reversion.register()
class ReportForm(models.Model):
    id = AutoUUIDField()
    codename = models.CharField(max_length=250, unique=True)
    name = models.CharField(max_length=250)
    description = models.TextField()

    def __str__(self):
        return f'{self.codename} - {self.name}'


@reversion.register()
class ReportFormVersion(models.Model):
    id = AutoUUIDField()
    code = models.IntegerField()
    title = models.CharField(max_length=200)
    form = models.ForeignKey(
        'ReportForm',
        on_delete=models.CASCADE,
        related_name='versions',
    )
    form_schema = ValidatedJSONField(schema=FORM_SCHEMA, default=get_default_form)
    field_count = models.SmallIntegerField(default=0, editable=False)

    def save(self, *args, **kwargs):
        if bool(self.form_schema):
            self.field_count = get_schema_field_count(self.form_schema)
        # don't allow schema changes if the version has any instances
        previous_state = type(self).objects.filter(pk=self.id).first()
        if previous_state is not None and \
                self.instances.count() > 0 and \
                freeze(previous_state.form_schema) != freeze(self.form_schema):
            raise ValidationError("the version has at least one instance")
        return super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.form.codename} - v{self.code}'

    class Meta:
        unique_together = (('code', 'form',),)


@reversion.register()
class ReportFormInstance(models.Model):
    class State:
        OPEN = 'open'
        CLOSED = 'closed'
        NEW_SENDING = 'new_sending'
        NEW_SENT = 'new_sent'
        ANSWER_TO_VALIDATE = 'answer_to_validate'
        ANSWER_VALIDATED = 'answer_validated'
        ANSWER_SENDING = 'answer_sending'
        ANSWER_RECEIVED = 'answer_received'
        ANSWER_SENT = 'answer_sent'
        ANSWER_REVIEWED = 'answer_reviewed'

    STATE_TYPES = (
        (State.OPEN, 'Open'),
        (State.CLOSED, 'Closed'),
        (State.NEW_SENDING, 'Sending'),
        (State.NEW_SENT, 'Sent'),
        (State.ANSWER_TO_VALIDATE, 'To Validate'),
        (State.ANSWER_VALIDATED, 'Answer Validated'),
        (State.ANSWER_SENDING, 'Answer Sending'),
        (State.ANSWER_SENT, 'Answer Sent'),
        (State.ANSWER_RECEIVED, 'Answer Received'),
        (State.ANSWER_REVIEWED, 'Answer Reviewed'),
    )

    CLOSED_STATES = [
        State.ANSWER_REVIEWED,
        State.CLOSED
    ]

    SENT_STATES = [
        State.ANSWER_SENT,
        State.ANSWER_RECEIVED,
        State.ANSWER_REVIEWED,
    ]

    id = AutoUUIDField()
    version = models.ForeignKey(
        'ReportFormVersion',
        on_delete=models.PROTECT,
        related_name='instances',
    )
    trimester = models.PositiveSmallIntegerField(validators=[validators.MinValueValidator(1),
                                                             validators.MaxValueValidator(4)])
    year = models.PositiveSmallIntegerField()
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    answer = JSONField(default=dict, blank=True)
    answer_started = models.BooleanField(default=False, editable=False)
    sent_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name='+',
        blank=True,
        null=True,
    )
    sent_at = models.DateTimeField(blank=True, null=True)
    received_at = models.DateTimeField(blank=True, null=True)
    state = models.CharField(
        max_length=200,
        choices=STATE_TYPES,
        default=State.NEW_SENDING,
    )
    reason = models.TextField(default='')
    target = models.ForeignKey(
        'targets.Target',
        on_delete=models.PROTECT,
        related_name='form_instances',
    )
    documents = models.ManyToManyField(
        'documents.Document',
        related_name='+',
        blank=True,
    )

    @cached_property
    def answer_count(self):
        count = 0
        if bool(self.answer):
            count = len(self.answer)
        return count

    def validate_answer(self, answer):
        return validate_answer_for_schema(answer, self.version.form_schema)

    def save(self, *args, **kwargs):
        if not self.answer_started:
            self.answer_started = bool(self.answer)
        return super().save(*args, **kwargs)

    def __str__(self):
        return f'{str(self.version)}  (Target: {str(self.target)}, trimester: {self.trimester}, year: {self.year})'

    class Meta:
        ordering = ['-created_at']


class ReportFormComment(models.Model):
    id = AutoUUIDField()
    form_instance = models.ForeignKey(
        'ReportFormInstance',
        on_delete=models.CASCADE,
        related_name='comments',
        editable=False,
    )
    content = models.TextField()
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name='+',
        null=True,
    )
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)


class FormInstanceRequest(models.Model):
    class State:
        CREATED = 'created'
        ACCEPTED = 'accepted'
        REJECTED = 'rejected'

        STATE_TYPES = (
            (CREATED, 'Request created'),
            (ACCEPTED, 'Request accepted'),
            (REJECTED, 'Request rejected'),
        )

    id = AutoUUIDField()
    new_instance = models.ForeignKey(
        'ReportFormInstance',
        on_delete=models.PROTECT,
        related_name='+',
        null=True,
        blank=True
    )
    old_instance = models.ForeignKey(
        'ReportFormInstance',
        on_delete=models.PROTECT,
        related_name='form_requests',
    )
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name='+',
        null=True,
        blank=True
    )
    received_at = models.DateTimeField(blank=True, null=True)
    state = models.CharField(
        max_length=200,
        choices=State.STATE_TYPES,
        default=State.CREATED,
    )
    comment = models.TextField(blank=True, null=True)

    def __str__(self):
        return f'{str(self.old_instance)}  (Created at: {str(self.created_at)})'

    class Meta:
        ordering = ['-created_at']


class FormCase(models.Model):
    class State:
        OPEN = 'open'
        CLOSED = 'closed'

    STATE_TYPES = (
        (State.OPEN, 'Open'),
        (State.CLOSED, 'Closed'),
    )

    id = AutoUUIDField()
    form_instance = models.ForeignKey(
        'ReportFormInstance',
        on_delete=models.CASCADE,
        related_name='cases',
        editable=False,
    )

    reassign_to = models.ForeignKey(
        'ReportFormInstance',
        on_delete=models.CASCADE,
        related_name='instance',
        editable=False,
        null=True,
    )

    title = models.CharField(max_length=200)
    description = models.TextField()
    state = models.CharField(
        max_length=20,
        choices=STATE_TYPES,
        default=State.OPEN,
    )
    documents = models.ManyToManyField(
        'documents.Document',
        related_name='+',
        blank=True,
    )

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name='+',
        null=True,
    )
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    closed_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        ordering = ['-created_at']


class FormCaseComment(models.Model):
    case = models.ForeignKey(
        'FormCase',
        on_delete=models.CASCADE,
        related_name='comments',
        editable=False,
    )
    content = models.TextField()
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name='+',
        null=True,
    )
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
