import jsonschema
from django.utils.functional import cached_property
from rest_framework import serializers

from alerts.collector import target_controllers
from alerts.engine import user_dry_runs
from alerts.models import Ticket, UserIntent
from api.v1.serializers.ticket_serializers import TicketListSerializer, TicketSerializer
from api.v1.serializers.user_serializers import UserSerializer, serialize_author
from documents.models import Document


class StatusSerializer(serializers.Serializer):
    module = serializers.CharField()
    name = serializers.CharField()
    description = serializers.CharField()
    states = serializers.ListField(child=serializers.CharField())
    child_modules = serializers.ListField(child=serializers.CharField())
    parent_modules = serializers.ListField(child=serializers.CharField())
    visibility_groups = serializers.ListField(child=serializers.CharField())
    result_state = serializers.SerializerMethodField()
    ticket = serializers.SerializerMethodField()

    @property
    def instances(self):
        try:
            return list(self.instance)
        except TypeError:
            return [self.instance]

    @cached_property
    def tickets(self):
        queryset = (
            Ticket.objects
            .select_related("target")
            .filter(module__in=[i.module for i in self.instances])
            .exclude(state=Ticket.TicketState.CLOSED)
        )
        if self.context.get("target") is not None:
            queryset = queryset.filter(
                target=self.context.get("target")
            )
        return {t.module: t for t in queryset}

    @cached_property
    def controllers(self):
        target = self.context.get("target")
        if not target:
            return {}
        return target_controllers(target)

    def get_result_state(self, controller):
        ticket = self.tickets.get(controller.module)
        if ticket is None:
            return Ticket.empty_result_state
        return ticket.result_state

    def get_ticket(self, controller):
        ticket = self.tickets.get(controller.module)
        if ticket is None:
            return None
        serializer = (
            TicketListSerializer
            if self.parent
            else TicketSerializer
        )(ticket)
        return serializer.data

    @classmethod
    def summarize(cls, data):
        evaluable = [
            entry
            for entry in data
            if entry["ticket"] is None
            or entry["ticket"]["evaluable"]
        ]
        max_level = max([0, *(entry["result_state"]["level"] for entry in evaluable)])
        max_states = [
            entry["result_state"]
            for entry in evaluable
            if entry["result_state"]["level"] == max_level
        ]
        short_message = (
            ""
            if max_level == 0 or not max_states
            else (
                max_states[0].get("short_message", "")
                if len(max_states) == 1
                else f"{len(max_states)} problemas"
            )
        )
        message = (
            ""
            if max_level == 0 or not max_states
            else (
                max_states[0].get("message", "")
                if len(max_states) == 1
                else "\n".join(filter(bool, (s.get("short_message") for s in max_states)))
            )
        )
        return {
            "level": max_level,
            "short_message": short_message,
            "message": message,
        }


class StatusDetailSerializer(StatusSerializer):

    dry_runs = serializers.SerializerMethodField()

    def get_dry_runs(self, controller):
        ticket = self.tickets.get(controller.module)
        runs = user_dry_runs(self.context.get("target"), controller, ticket, self.context.get("request").user)
        return [run._asdict() for run in runs]


def validate_intent_content(content):
    if content is None:
        raise serializers.ValidationError("Not an object")
    try:
        jsonschema.validate(content, UserIntent.CONTENT_SCHEMA)
    except jsonschema.ValidationError as e:
        raise serializers.ValidationError(e.message)


class UserIntentCreateSerializer(serializers.Serializer):
    content = serializers.JSONField(validators=[validate_intent_content])

    @cached_property
    def target(self):
        return self.context.get("target")

    @cached_property
    def controllers(self):
        if self.target is None:
            return {}
        return target_controllers(self.target)

    @property
    def controller(self):
        return self.controllers.get(self.context.get("module"))

    def validate(self, data):
        if not self.target:
            raise serializers.ValidationError("target not found")
        if not self.controller:
            raise serializers.ValidationError("module not found")
        if "state" in data["content"] and data["content"]["state"] not in self.controller.states and \
           data["content"]["state"] != Ticket.TicketState.CLOSED:
            raise serializers.ValidationError(f"state {data['content']['state']} is invalid")
        if data["content"].get("document") and \
           not Document.objects.filter(id=data["content"].get("document")).exists():
            raise serializers.ValidationError("document doesn't exist")
        return data

    def save(self):
        intent = UserIntent.objects.create(
            target=self.target,
            user=self.context.get("user"),
            serialized_user=serialize_author(self.context.get("user")),
            module=self.controller.module,
            content=self.validated_data["content"],
            issue="",
        )
        return intent


class UserIntentSerializer(serializers.ModelSerializer):

    user = UserSerializer(read_only=True)
    target = serializers.SlugRelatedField(read_only=True, slug_field='canonical_name')

    class Meta:
        model = UserIntent
        fields = (
            "id",
            "created_at",
            "user",
            "serialized_user",
            "target",
            "module",
            "content",
            "attended_at",
            "sent_to_destination_at",
            "attended_by_destination_at",
            "origin",
            "issue",
        )
