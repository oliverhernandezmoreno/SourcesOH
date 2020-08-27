import coreapi
import coreschema
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import NotFound, PermissionDenied
from rest_framework.response import Response

from alerts import engine
from alerts.collector import target_controllers
from alerts.models import ContributingDocument, Ticket
from api.v1.serializers.status_serializers import (
    StatusSerializer,
    StatusDetailSerializer,
    UserIntentCreateSerializer,
    UserIntentSerializer,
)
from api.v1.serializers.ticket_serializers import TicketListSerializer
from base.permissions import Authenticated
from base import schemas
from documents.models import Document
from documents.views import DocumentReadOnlyViewSet, DocumentUploadMixin
from targets.mixins import NestedInTargetMixin
from targets.models import Target


class CustomStatusViewSchema(schemas.CustomSchema):

    @schemas.parameters.get('/status/')
    def group_parameter(self):
        return [
            coreapi.Field(
                name='group',
                required=False,
                location='query',
                schema=coreschema.String(
                    description='A comma-separated list of groups used to filter controllers',
                ),
            ),
        ]

    @schemas.parameters.post('/status/{module}/intent/')
    def content_parameter(self):
        return [
            coreapi.Field(
                name='content',
                required=True,
                location='body',
                schema=coreschema.Object(
                    description='The body of the intent',
                ),
            ),
        ]


class StatusView(NestedInTargetMixin, viewsets.ViewSet):
    lookup_value_regex = '[^/]+'
    lookup_field = 'module'
    permission_classes = (Authenticated,)
    schema = CustomStatusViewSchema.as_schema()
    serializer_class = StatusSerializer

    def get_serializer_class(self):
        if self.action == "retrieve":
            return StatusDetailSerializer
        return StatusSerializer

    def list(self, request, target_canonical_name=None):
        """Return the list of statuses"""
        target = self.target
        groups = frozenset(filter(bool, (request.query_params.get("group") or "").split(",")))
        controllers = list(target_controllers(target).values())
        if groups:
            controllers = [
                c
                for c in controllers
                if frozenset(c.visibility_groups) & groups == groups
            ]
        serializer = self.get_serializer_class()(
            controllers,
            many=True,
            context={"request": request, "target": target},
        )
        return Response(data={
            "result_state": self.get_serializer_class().summarize(serializer.data),
            "status": serializer.data
        })

    def retrieve(self, request, target_canonical_name=None, module=None):
        """Get the status for a given module."""
        target = self.target
        controller = target_controllers(target).get(module)
        if not controller:
            return Response(status=404, data={"detail": "Module not found."})
        serializer = self.get_serializer_class()(
            controller,
            context={"request": request, "target": target},
        )
        return Response(data=serializer.data)

    def check_intent_permission(self, ticket, intent):
        if ticket is not None:
            base = f'ticket.{ticket.state_group}.'
            if intent.attempts_closing():
                if not self.has_target_perm(f'{base}close'):
                    raise PermissionDenied()
            elif intent.attempts_state_update(ticket.state):
                if not self.has_target_perm(f'{base}escalate.{intent.content.get("state")}'):
                    raise PermissionDenied()
            elif intent.attempts_archive_update(intent.content.get("archived")):
                if not self.has_target_perm(f'{base}archive'):
                    raise PermissionDenied()
            else:
                raise PermissionDenied()
        else:
            new_state = intent.content['state']
            if not self.has_target_perm(f'ticket.{new_state}.create'):
                raise PermissionDenied()

    @action(methods=["post"], detail=True, serializer_class=UserIntentCreateSerializer)
    def intent(self, request, target_canonical_name=None, module=None):
        """Create a user intent and run it against the alerts engine."""
        target = self.target
        serializer = UserIntentCreateSerializer(
            data={"content": request.data},
            context={
                "target": target,
                "module": module,
                "user": request.user,
            },
        )
        serializer.is_valid(raise_exception=True)
        intent = serializer.save()

        ticket = Ticket.objects.filter(
            target=target, module=module
        ).exclude(state=Ticket.TicketState.CLOSED).first()

        self.check_intent_permission(ticket, intent)

        if ticket is not None and ticket.origin != settings.NAMESPACE:
            # foreign ticket
            try:
                intent.send_to_origin()
            except ImproperlyConfigured:
                return Response(status=400, data={"detail": "Intent could not be sent to origin, target has no remote"})
            affected = []
        else:
            affected = engine.run(intent.target, hints=[module])
        intent.refresh_from_db()
        return Response(data={
            "intent": UserIntentSerializer(intent).data,
            "tickets": TicketListSerializer(affected, many=True).data,
        }, status=201)


class ContributingDocumentView(DocumentReadOnlyViewSet, DocumentUploadMixin, mixins.DestroyModelMixin):
    permission_classes = (Authenticated,)

    def parse_url_kwargs(self):
        try:
            target = Target.objects.get(canonical_name=self.kwargs.get('target_canonical_name'))
        except Target.DoesNotExist:
            raise NotFound(detail="Target not found.")
        module = self.kwargs.get('status_module')
        if target_controllers(target).get(module) is None:
            raise NotFound(detail="Module not found.")
        return target, module

    def get_queryset(self):
        target, module = self.parse_url_kwargs()
        return Document.objects.filter(
            contributions__in=ContributingDocument.objects.filter(
                target=target,
                module=module,
            )
        ).distinct()

    def perform_document_create(self, *args, **kwargs):
        target, module = self.parse_url_kwargs()
        doc = super().perform_document_create(*args, **kwargs)
        ContributingDocument.objects.create(
            target=target,
            document=doc,
            module=module,
        )
        return doc

    def get_folder(self):
        t = self.kwargs.get('target_canonical_name')
        m = self.kwargs.get('status_module')
        return f"documents/status/{t}/{m}"
