import jsonschema
from rest_framework import serializers
from rest_framework_recursive.fields import RecursiveField

from alerts.models import (
    Ticket, TicketLog, Broadcast, TicketComment,
    PublicAlertMessage, AuthorizationRequest, AlertDisconnection
)
from api.v1.handlers.utils import get_events
from api.v1.serializers.target_serializers import TargetTicketDataSerializer
from api.v1.serializers.user_serializers import UserSerializer
from documents.serializers import DocumentSerializer


class TicketLogSerializer(serializers.ModelSerializer):
    documents = DocumentSerializer(read_only=True, many=True)
    timeseries = serializers.SerializerMethodField(read_only=True)
    ticket = serializers.PrimaryKeyRelatedField(read_only=True)
    meta = serializers.JSONField(read_only=True)
    message = serializers.CharField(write_only=True, help_text="Mensaje a comunicar como antecedente")

    class Meta:
        model = TicketLog
        fields = (
            'id', 'created_at', 'ticket', 'documents', 'author',
            'timeseries', 'meta', 'message',
        )
        read_only_fields = (
            'id', 'created_at', 'highlight', 'ticket', 'documents', 'author',
            'timeseries', 'meta'
        )

    def get_timeseries(self, obj):
        if not self.context.get("event_data", True):
            return []
        events_ids = [e for ts in obj.timeseries for e in ts.get('events', [])]
        events = get_events(events_ids)
        return [
            {
                **ts,
                'events': [e for e in events if e['name'] == ts['canonical_name']]
            }
            for ts in obj.timeseries
        ]


class BroadcastSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    ticket = serializers.PrimaryKeyRelatedField(read_only=True)
    handlers = serializers.JSONField(
        help_text="The handlers that should deal with the broadcasting task",
    )

    class Meta:
        model = Broadcast
        fields = (
            'id', 'created_at', 'broadcasted_at', 'ticket', 'handlers', 'author',
        )

    def validate_handlers(self, value):
        try:
            jsonschema.validate(value, Broadcast.HANDLERS_SCHEMA)
        except jsonschema.ValidationError as e:
            raise serializers.ValidationError(e.message)
        return value

    def validate(self, data):
        target_canonical_name = self.context.get("kwargs", {}).get("target_canonical_name")
        ticket_id = self.context.get("kwargs", {}).get("ticket_pk")
        if ticket_id is None or not Ticket.objects.filter(
                pk=ticket_id,
                target__canonical_name=target_canonical_name,
        ).exists():
            raise serializers.ValidationError("ticket not found")
        return data

    def save(self):
        ticket = Ticket.objects.get(pk=self.context["kwargs"]["ticket_pk"])
        return Broadcast.objects.create(
            ticket=ticket,
            handlers=self.validated_data["handlers"],
            author=self.context["request"].user,
        )


class TicketNestedChildSerializer(serializers.ModelSerializer):
    target = serializers.SlugRelatedField(read_only=True, slug_field='canonical_name')

    class Meta:
        model = Ticket
        fields = ['id', 'target', 'archived', 'evaluable', 'close_conditions', 'result_state', 'state']


class TicketListSerializer(serializers.ModelSerializer):
    target = TargetTicketDataSerializer(read_only=True)
    module_name = serializers.SerializerMethodField()
    children = TicketNestedChildSerializer(many=True, read_only=True)

    class Meta:
        model = Ticket
        fields = (
            'id', 'target', 'module_name', 'created_at', 'updated_at', 'module',
            'state', 'result_state', 'close_conditions', 'spread_object', 'archived',
            'evaluable', 'base_module', 'children', 'public_alert_abstract'
        )

    def get_module_name(self, obj):
        controller = obj.base_controller
        return controller.name if controller is not None else None


class TicketSerializer(serializers.ModelSerializer):
    target = TargetTicketDataSerializer(read_only=True)
    module_name = serializers.SerializerMethodField()
    children = serializers.SerializerMethodField()
    parents = TicketListSerializer(many=True, read_only=True)
    logs = serializers.SerializerMethodField()
    broadcasts = BroadcastSerializer(many=True, read_only=True)

    class Meta:
        model = Ticket
        fields = (
            'id', 'target', 'module_name', 'created_at', 'updated_at', 'module', 'state', 'result_state',
            'close_conditions', 'archive_conditions', 'escalate_conditions', 'spread_object', 'archived', 'evaluable',
            'base_module', 'children', 'parents', 'logs', 'broadcasts', 'groups', 'base_module', 'public_alert_abstract'
        )

    def get_children(self, obj):
        if self.context.get("children", True):
            return TicketNestedChildSerializer(obj.children, many=True).data
        else:
            return []

    def get_logs(self, obj):
        if self.context.get("logs", True):
            return TicketLogSerializer(obj.logs, many=True, context={
                "event_data": self.context.get("event_data", True)
            }).data
        else:
            return []

    def get_module_name(self, obj):
        controller = obj.base_controller
        return controller.name if controller is not None else None


class TicketArchiveActionSerializer(serializers.Serializer):
    archived = serializers.BooleanField()
    description = serializers.CharField()

    def save(self):
        self.instance.archive(
            self.validated_data["archived"],
            author=self.context.get("request").user,
            description=self.validated_data["description"],
        )
        return self.instance


class TicketCommentSerializer(serializers.ModelSerializer):
    created_by = serializers.SerializerMethodField(read_only=True)
    documents = DocumentSerializer(read_only=True, many=True)

    class Meta:
        model = TicketComment
        fields = ('id', 'content', 'created_by', 'created_at', 'updated_at', 'comment_type', 'documents')

    def get_created_by(self, obj):
        if 'username' in obj.created_by:
            return obj.created_by['username']
        return None


def message_documents(obj, context):
    docs = context.get('documents')
    query = obj.documents.all()
    ids = [d.id for d in query]
    return [doc[2] for doc in docs if doc[0] in ids]


class TicketLogMessageSerializer(serializers.ModelSerializer):
    documents = serializers.SerializerMethodField()

    class Meta:
        model = TicketLog
        fields = ('id', 'created_at', 'highlight', 'documents', 'author', 'timeseries', 'meta', 'origin')

    def get_documents(self, obj):
        return message_documents(obj, self.context)


class TicketCommentMessageSerializer(serializers.ModelSerializer):
    documents = serializers.SerializerMethodField()

    def get_documents(self, obj):
        return message_documents(obj, self.context)

    class Meta:
        model = TicketComment
        fields = ('id', 'comment_type', 'content', 'created_by', 'created_at', 'updated_at', 'documents', 'origin')


class TicketMessageSerializer(TicketSerializer):
    target = serializers.SlugRelatedField(read_only=True, slug_field='canonical_name')
    children = RecursiveField(many=True, read_only=True)
    logs = serializers.SerializerMethodField(read_only=True)
    comments = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Ticket
        fields = (
            'id', 'created_at', 'updated_at', 'module', 'state',
            'result_state', 'target', 'spread_object', 'children', 'archived', 'evaluable',
            'groups', 'close_conditions', 'logs', 'origin', 'comments'
        )

    def get_logs(self, obj):
        return TicketLogMessageSerializer(obj.logs, many=True, context=self.context).data

    def get_comments(self, obj):
        return TicketCommentMessageSerializer(obj.comments, many=True, context=self.context).data


class PublicAlertMessageSerializer(serializers.ModelSerializer):
    created_by = serializers.SerializerMethodField()
    target = serializers.SlugRelatedField(read_only=True, slug_field='canonical_name')

    class Meta:
        model = PublicAlertMessage
        fields = (
            'id', 'target', 'alert_type', 'content',
            'created_by', 'created_at', 'scope'
        )

    def get_created_by(self, obj):
        if 'username' in obj.created_by:
            return obj.created_by['username']
        return None


class AuthorizationRequestSerializer(serializers.ModelSerializer):
    documents = DocumentSerializer(read_only=True, many=True)

    class Meta:
        model = AuthorizationRequest
        fields = (
            'id', 'authorization', 'created_by', 'created_at', 'origin',
            'resolved_by', 'resolved_at', 'comment', 'documents',
            'status', 'ticket'
        )
        read_only_fields = (
            'id', 'authorization', 'created_by', 'created_at', 'origin',
            'resolved_by', 'resolved_at', 'documents', 'status', 'ticket'
        )


class TicketSmallSerializer(serializers.ModelSerializer):
    module_name = serializers.SerializerMethodField(method_name='get_module_name')
    scope = serializers.SerializerMethodField(method_name='get_scope')
    target = TargetTicketDataSerializer(read_only=True)

    class Meta:
        model = Ticket
        fields = (
            'id', 'target', 'module_name', 'module', 'state', 'result_state',
            'close_conditions', 'archive_conditions', 'escalate_conditions', 'archived',
            'evaluable', 'base_module', 'scope'
        )

    def get_module_name(self, obj):
        controller = obj.base_controller
        return controller.name if controller is not None else None

    def get_scope(self, obj):
        EF = 'ef'
        EMAC = 'emac'
        groups = obj.groups
        if f'/{EF}/' in groups:
            return EF
        elif f'/{EMAC}/' in groups:
            return EMAC
        else:
            return None


class AuthorizationRequestTicketSerializer(serializers.ModelSerializer):
    ticket = TicketSmallSerializer(read_only=True)

    class Meta:
        model = AuthorizationRequest
        fields = (
            'id', 'authorization', 'created_by', 'created_at', 'resolved_by', 'resolved_at', 'status', 'ticket'
        )


class AuthorizationRequestCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuthorizationRequest
        fields = (
            'id', 'origin', 'ticket', 'authorization', 'created_by', 'created_at',
        )


class AuthorizationRequestUpdateSerializer(serializers.ModelSerializer):
    documents = serializers.SerializerMethodField()

    def get_documents(self, obj):
        return message_documents(obj, self.context)

    def validate_status(self, value):
        if value not in [
            AuthorizationRequest.Status.APPROVED,
            AuthorizationRequest.Status.DENIED,
        ]:
            raise serializers.ValidationError("Blog post is not about Django")
        return value

    class Meta:
        model = AuthorizationRequest
        fields = (
            'id', 'resolved_by', 'resolved_at', 'comment', 'documents', 'status',
        )


class AlertDisconnectionSerializer(serializers.ModelSerializer):
    created_by = serializers.SerializerMethodField()
    target = serializers.SlugRelatedField(read_only=True, slug_field='canonical_name')

    class Meta:
        model = AlertDisconnection
        fields = (
            'id', 'target', 'scope', 'comment',
            'created_by', 'created_at', 'closed', 'closed_at'
        )

    def get_created_by(self, obj):
        if 'username' in obj.created_by:
            return obj.created_by['username']
        return None
