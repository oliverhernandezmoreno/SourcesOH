import itertools
from functools import reduce

import coreapi
import coreschema
from django.conf import settings
from django.db.models import Q
from django.utils import timezone
from django_filters import rest_framework as filters
from guardian.shortcuts import get_objects_for_user
from rest_framework import mixins, viewsets, parsers, status
from rest_framework.decorators import action
from rest_framework.exceptions import NotFound, ValidationError, PermissionDenied
from rest_framework.response import Response

from alerts import engine
from alerts.models import (
    Ticket, TicketLog, Broadcast, TicketComment, PublicAlertMessage,
    AuthorizationRequest, AlertDisconnection, ManualAlertLog,
)
from alerts.modules.base_states import ALERT_STATES, EVENT_STATES, AUTHORIZATION_LEVELS, ALL_TICKET_STATES
from alerts.modules.conditions import get_next_authorization
from api.v1.handlers.alert_utils import get_ticket_bucket
from api.v1.serializers.ticket_serializers import (
    TicketListSerializer,
    TicketSerializer,
    TicketLogSerializer,
    BroadcastSerializer,
    TicketCommentSerializer,
    TicketArchiveActionSerializer,
    PublicAlertMessageSerializer,
    AuthorizationRequestSerializer,
    AuthorizationRequestTicketSerializer,
    AuthorizationRequestCreateSerializer,
    AuthorizationRequestUpdateSerializer,
    AlertDisconnectionSerializer,
    ManualAlertLogSerializer
)
from api.v1.serializers.user_serializers import UserSerializer, serialize_author
from base.filters import FilterListBackend
from base.permissions import Authenticated, UserPermissionChecker
from base import schemas
from documents.models import Document
from documents.utils import serialize_docs_for_upload, upload_docs
from documents.views import DocumentReadOnlyViewSet, DocumentUploadMixin
from remotes.dispatch import send_simple_message, send_simple_smc_message
from targets.mixins import NestedInTargetMixin
from targets.models import Target


class TicketFilter(filters.FilterSet):
    open = filters.CharFilter(
        method='open_filter',
        help_text="Tickets still open",
    )
    archived = filters.BooleanFilter(
        help_text="Archived tickets, which might or might not be open",
    )
    evaluable = filters.BooleanFilter(
        help_text="Evaluable tickets, which might or might not be open",
    )
    module = filters.CharFilter(
        help_text="The exact name of the module specification",
    )
    level = filters.NumberFilter(method='level_filter')
    level_lte = filters.NumberFilter(method='level_filter')
    level_lt = filters.NumberFilter(method='level_filter')
    level_gte = filters.NumberFilter(method='level_filter')
    level_gt = filters.NumberFilter(method='level_filter')
    group = filters.CharFilter(
        method='group_filter',
        help_text="The comma-separated groups the ticket belongs to",
    )

    class Meta:
        model = Ticket
        fields = ('open', 'archived', 'evaluable', 'module')

    def open_filter(self, queryset, name, value):
        if name == 'open' and value is not None and \
                value.lower() in ('true', 'yes', '1', 'y'):
            return queryset.exclude(state__exact=Ticket.TicketState.CLOSED)
        if name == 'open' and value is not None and \
                value.lower() in ('false', 'no', '0', 'n'):
            return queryset.filter(state__exact=Ticket.TicketState.CLOSED)
        return queryset

    def level_filter(self, queryset, name, value):
        op = {
            'level': '',
            'level_lte': '__lte',
            'level_lt': '__lt',
            'level_gte': '__gte',
            'level_gt': '__gt',
        }.get(name)
        if op is None:
            return queryset
        return queryset.filter(**{f'result_state__level{op}': int(value)})

    def group_filter(self, queryset, name, value):
        if name != 'group':
            return queryset
        groups = frozenset(filter(bool, (value or "").split(",")))
        if not groups:
            return queryset
        return queryset.filter(reduce(
            lambda acc, q: acc & q,
            map(lambda g: Q(groups__contains=f"/{g}/"), groups),
        ))


class TicketsView(viewsets.ModelViewSet):
    permission_classes = (Authenticated,)
    filter_backends = [FilterListBackend]
    filterset_class = TicketFilter
    serializer_class = TicketListSerializer

    def has_target_perm(self, target, codename):
        checker = getattr(self, '_checker', None)
        if checker is None:
            checker = UserPermissionChecker(self.request.user)
            checker.prefetch_perms(Target.objects.all())
            setattr(self, '_checker', checker)
        return checker.has_perm(codename, target)

    def get_queryset(self):
        perms = [
            f'targets.ticket.{state}.read'
            for state in ALL_TICKET_STATES
        ]
        targets = get_objects_for_user(
            user=self.request.user,
            perms=perms,
            klass=Target.objects.all(),
            any_perm=True
        )
        if len(targets) > 0:
            ticket_filters = []
            for target in targets:
                state_filters = [
                    Q(state__startswith=state)
                    for state in ALL_TICKET_STATES
                    if self.has_target_perm(target, f'targets.ticket.{state}.read')
                ]
                ticket_filters.append(
                    Q(target=target) & reduce(lambda acc, q: acc | q, state_filters)
                )
            queryset = Ticket.objects.filter(
                reduce(lambda acc, q: acc | q, ticket_filters)
            ).prefetch_related('target')
        else:
            queryset = Ticket.objects.none()
        return queryset


class TicketView(NestedInTargetMixin, viewsets.ReadOnlyModelViewSet):
    permission_classes = (Authenticated,)
    filter_backends = [FilterListBackend]
    filterset_class = TicketFilter

    def get_queryset(self):
        state_filters = [
            Q(state__startswith=state)
            for state in ALL_TICKET_STATES
            if self.has_target_perm(f'ticket.{state}.read')
        ]
        if len(state_filters) > 0:
            queryset = Ticket.objects.filter(
                target=self.target
            ).prefetch_related(
                'target'
            ).filter(
                reduce(lambda acc, q: acc | q, state_filters)
            )
        else:
            queryset = Ticket.objects.none()
        return queryset

    def get_serializer_class(self):
        if self.action == 'list':
            return TicketListSerializer
        return TicketSerializer

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        state = instance.state_group
        serializer = TicketSerializer(instance, context={
            "children": self.has_target_perm(f'ticket.{state}.children.read'),
            "logs": self.has_target_perm(f'ticket.{state}.log.read'),
            "event_data": self.has_target_perm(f'ticket.{state}.event_data.read'),
        })
        return Response(serializer.data)

    @action(methods=["post"], detail=True, serializer_class=TicketArchiveActionSerializer)
    def archive(self, request, **kwargs):
        ticket = self.get_object()
        action_serializer = TicketArchiveActionSerializer(
            ticket,
            data=request.data,
            context=self.get_serializer_context(),
        )
        action_serializer.is_valid(raise_exception=True)
        action_serializer.save()
        ticket.refresh_from_db()
        return Response(data=self.get_serializer_class()(ticket).data)


class NestedInTicketMixin(NestedInTargetMixin):
    _ticket = None

    def resolve_ticket(self):
        pk = self.kwargs.get("ticket_pk")
        ticket = Ticket.objects.filter(target=self.target, pk=pk).first()
        if ticket is None or not self.has_target_perm(f'ticket.{ticket.state_group}.read'):
            raise NotFound(detail="Ticket not found.")
        return ticket

    @property
    def ticket(self):
        if self._ticket is None:
            self._ticket = self.resolve_ticket()
        return self._ticket

    def has_ticket_perm(self, suffix):
        return self.has_target_perm(f'ticket.{self.ticket.state_group}.{suffix}')


class TicketLogView(NestedInTicketMixin, viewsets.ReadOnlyModelViewSet):
    permission_classes = (Authenticated,)
    serializer_class = TicketLogSerializer
    parser_classes = (parsers.JSONParser, parsers.MultiPartParser)

    def get_queryset(self):
        if not self.has_ticket_perm('log.read'):
            raise PermissionDenied()
        return self.ticket.logs.all()

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        return {**ctx, "kwargs": self.kwargs}

    def create(self, request, *args, **kwargs):
        if not self.has_ticket_perm('log.write'):
            raise PermissionDenied()

        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        message = serializer.validated_data.pop('message')
        log = serializer.save(
            ticket=self.ticket,
            author=serialize_author(request.user),
            meta={'message': message}
        )
        folder = self.ticket.get_document_folder('log', log.id)
        for file in request.FILES.values():
            log.documents.add(
                Document.objects.create(
                    folder=folder,
                    file=file,
                    name=str(file),
                    uploaded_by=request.user
                )
            )
        return Response(data=self.serializer_class(log).data, status=201)


class TicketLogDocumentView(NestedInTicketMixin, DocumentReadOnlyViewSet):
    def get_queryset(self):
        if not self.has_ticket_perm('log.read'):
            raise PermissionDenied()
        try:
            authorization = AuthorizationRequest.objects.get(
                ticket=self.ticket, pk=self.kwargs.get("authorization_pk"),
            )
        except AuthorizationRequest.DoesNotExist:
            raise NotFound(detail="AuthorizationRequest not found.")
        return authorization.documents.all()


class BroadcastView(mixins.CreateModelMixin, viewsets.ReadOnlyModelViewSet):
    permission_classes = (Authenticated,)
    serializer_class = BroadcastSerializer
    queryset = Broadcast.objects.all()

    def get_queryset(self):
        return self.queryset.filter(
            ticket=self.kwargs.get("ticket_pk"),
            ticket__target__canonical_name=self.kwargs.get("target_canonical_name"),
        )

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        return {**ctx, "kwargs": self.kwargs}

    def create(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data, context=self.get_serializer_context())
        serializer.is_valid(raise_exception=True)
        broadcast = serializer.save()
        return Response(data=self.serializer_class(broadcast).data, status=201)


class AuthorizationRequestViewSchema(schemas.CustomSchema):

    @schemas.serializers.post('/authorization/')
    def authorization_fields(self):
        return [
            coreapi.Field(
                name='action',
                required=True,
                location='body',
                schema=coreschema.String(
                    description='Action for which the authorization will be created (close, escalate, archive)',
                ),
            ),
            coreapi.Field(
                name='to_state',
                required=False,
                location='body',
                schema=coreschema.String(
                    description='escalation target state, required only when action=escalate',
                ),
            ),
        ]


class TicketAuthorizationRequestView(NestedInTicketMixin, mixins.CreateModelMixin, viewsets.ReadOnlyModelViewSet):
    permission_classes = (Authenticated,)
    serializer_class = AuthorizationRequestSerializer
    schema = AuthorizationRequestViewSchema.as_schema()

    def get_authorization_read_filters(self):
        state = self.ticket.state_group
        if state in ALERT_STATES:
            states = ALERT_STATES
        elif state in EVENT_STATES:
            states = EVENT_STATES
        else:
            raise ValidationError('Ticket state group unknown')

        permissions = []
        for level in AUTHORIZATION_LEVELS:
            permissions.extend([
                f'close.authorization.{level}.read',
                f'archive.authorization.{level}.read'
            ])
        permissions.extend([
            f'escalate.{to_state}.authorization.{level}.read'
            for to_state, level in itertools.product(states, AUTHORIZATION_LEVELS)
            if state != to_state
        ])

        readable_authorizations = [
            f'ticket.{self.ticket.state_group}.{perm[:-5]}'
            for perm in permissions
            if self.has_ticket_perm(perm)
        ]
        if len(readable_authorizations) > 0:
            return reduce(
                lambda acc, q: acc | q,
                [
                    Q(authorization=auth)
                    for auth in readable_authorizations
                ]
            )

        return None

    def get_queryset(self):
        auth_filters = self.get_authorization_read_filters()
        if auth_filters is None:
            raise PermissionDenied()
        return self.ticket.authorizations.filter(auth_filters)

    def create(self, request, *args, **kwargs):
        ticket = self.ticket
        _action = request.data.get('action', '')
        if _action == 'close':
            conditions = ticket.close_conditions
        elif _action == 'archive':
            conditions = ticket.archive_conditions
        elif _action == 'escalate':
            to_state = request.data.get('to_state', None)
            if to_state is None:
                raise ValidationError({'to_state': 'required'})
            if to_state not in ticket.escalate_conditions:
                raise ValidationError({'to_state': f'no escalate to {to_state} conditions'})
            conditions = ticket.escalate_conditions[to_state]
        else:
            raise ValidationError({'action': f'Action {_action} not supported'})
        authorization = get_next_authorization(conditions, request.user)
        if authorization is None:
            raise ValidationError({'action': 'No new authorization required'})
        if not self.has_target_perm(f'{authorization}.request'):
            raise PermissionDenied()
        if self.get_queryset().filter(
                status=AuthorizationRequest.Status.PENDING,
                authorization=authorization
        ).exists():
            raise ValidationError({'action': 'there is a pending authorization request'})
        auth_request = AuthorizationRequest.objects.create(
            authorization=authorization,
            ticket=ticket,
            created_by=serialize_author(request.user)
        )
        # Creating a new log entry
        log = TicketLog.new_request_entry(
            ticket=ticket,
            author=request.user,
            authorization_string=authorization
        )
        log.save()

        if settings.STACK_IS_SML and '.authority-' in authorization:
            send_simple_smc_message(
                'alerts.ticket.authorization.create',
                AuthorizationRequestCreateSerializer(auth_request).data
            )
        else:
            # update ticket conditions
            engine.update_ticket_conditions(ticket)
        return Response(data=AuthorizationRequestSerializer(auth_request).data, status=201)

    def _resolve_authorization_request(self, request, authorization_request, new_status):
        ticket = self.ticket
        if authorization_request.status != AuthorizationRequest.Status.PENDING:
            raise ValidationError(f'only pending authorizations can be {new_status}')
        serializer = AuthorizationRequestSerializer(
            authorization_request,
            data=request.data,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save(
            resolved_by=serialize_author(request.user),
            resolved_at=timezone.now(),
            status=new_status
        )
        authorization_request.refresh_from_db()
        ticket_id = authorization_request.ticket.id
        folder = f'documents/ticket/{ticket_id}/authorization/{authorization_request.id}/'
        for file in request.FILES.values():
            authorization_request.documents.add(
                Document.objects.create(
                    folder=folder,
                    file=file,
                    name=str(file),
                    uploaded_by=request.user,
                    meta={'request_id': {'value': authorization_request.id}}
                )
            )
        # Creating a new log entry
        log = TicketLog.new_authorization_entry(
            ticket=ticket,
            author=request.user,
            authorization_request=authorization_request,
            new_status=new_status,
        )
        log.save()
        for doc in authorization_request.documents.all():
            log.documents.add(doc)

        if not settings.STACK_IS_SML and authorization_request.origin != settings.NAMESPACE:
            remote = authorization_request.ticket.target.remote
            if remote is not None:
                documents = list(serialize_docs_for_upload(authorization_request.documents.all(), folder))
                bucket = get_ticket_bucket(authorization_request.ticket)
                upload_docs(documents, bucket)
                send_simple_message(
                    'alerts.ticket.authorization.update',
                    body=AuthorizationRequestUpdateSerializer(
                        authorization_request,
                        context={'documents': documents}
                    ).data,
                    exchange=remote.exchange
                )
            else:
                raise ValidationError(f'target remote is missing')
        else:
            # update ticket conditions
            engine.update_ticket_conditions(authorization_request.ticket)
        return Response(data=AuthorizationRequestSerializer(authorization_request).data)

    @action(
        methods=["post"],
        detail=True,
        parser_classes=(parsers.FormParser, parsers.MultiPartParser, parsers.JSONParser),
        serializer_class=AuthorizationRequestSerializer,
    )
    def approve(self, request, **kwargs):
        auth_request = self.get_object()
        if not self.has_target_perm(f'{auth_request.authorization}.resolve'):
            raise PermissionDenied()
        new_status = AuthorizationRequest.Status.APPROVED
        return self._resolve_authorization_request(request, auth_request, new_status)

    @action(
        methods=["post"],
        detail=True,
        parser_classes=(parsers.FormParser, parsers.MultiPartParser, parsers.JSONParser),
        serializer_class=AuthorizationRequestSerializer,
    )
    def deny(self, request, **kwargs):
        auth_request = self.get_object()
        if not self.has_target_perm(f'{auth_request.authorization}.resolve'):
            raise PermissionDenied()
        new_status = AuthorizationRequest.Status.DENIED
        return self._resolve_authorization_request(request, auth_request, new_status)


class AuthorizationRequestDocumentView(DocumentReadOnlyViewSet):
    # TODO use nested in ticket view and check authorization read permissions
    def get_queryset(self):
        try:
            authorization = AuthorizationRequest.objects.get(
                ticket=self.kwargs.get("ticket_pk"),
                ticket__target__canonical_name=self.kwargs.get("target_canonical_name"),
                pk=self.kwargs.get("authorization_pk"),
            )
        except AuthorizationRequest.DoesNotExist:
            raise NotFound(detail="AuthorizationRequest not found.")
        return authorization.documents.all()


class AuthorizationRequestView(viewsets.ReadOnlyModelViewSet):
    permission_classes = (Authenticated,)
    serializer_class = AuthorizationRequestTicketSerializer
    # TODO fix this queryset based on permissions
    queryset = AuthorizationRequest.objects.all()


class TicketCommentView(NestedInTicketMixin, viewsets.ModelViewSet):
    serializer_class = TicketCommentSerializer

    def get_queryset(self):
        state_group = self.ticket.state_group
        read_perms = [
            (
                f'ticket.{state_group}.close_report_comment.read',
                TicketComment.CommentType.CLOSE_REPORT
            ),
            (
                f'ticket.{state_group}.alert_management_comment.read',
                TicketComment.CommentType.ALERT_MANAGEMENT
            ),
            (
                f'ticket.{state_group}.alert_complementary_comment.read',
                TicketComment.CommentType.ALERT_COMPLEMENTARY
            ),
            (
                f'ticket.{state_group}.event_management_comment.read',
                TicketComment.CommentType.EVENT_MANAGEMENT
            )
        ]
        type_filters = [
            Q(comment_type=c_type)
            for c_perm, c_type in read_perms
            if self.has_target_perm(c_perm)
        ]
        if len(type_filters) > 0:
            queryset = self.ticket.comments.filter(
                reduce(lambda acc, q: acc | q, type_filters)
            )
        else:
            raise PermissionDenied()
        return queryset

    def perform_create(self, serializer):
        comment = serializer.save(ticket=self.ticket, created_by=UserSerializer(self.request.user).data)
        log = TicketLog.new_comment_entry(
            ticket=self.ticket,
            author=self.request.user,
            meta={
                "comment": comment.content,
                "description": "comment",
                "comment_id": comment.id,
                "comment_type": comment.comment_type
            },
        )
        log.save()
        folder = self.ticket.get_document_folder('comment', comment.id)
        for file in self.request.FILES.values():
            doc = Document.objects.create(
                folder=folder,
                file=file,
                name=str(file),
                uploaded_by=self.request.user
            )
            comment.documents.add(doc)
            log.documents.add(doc)
        engine.update_ticket_conditions(self.ticket)
        return log

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        types = list(c_type for c_type, _ in TicketComment.CommentType.choices)
        c_type = data.get('comment_type', 'None')
        if c_type not in types or not self.has_ticket_perm(f'{c_type}_comment.write'):
            raise PermissionDenied()
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class TicketCommentDocumentView(NestedInTicketMixin, DocumentReadOnlyViewSet):
    def get_queryset(self):
        comment_pk = self.kwargs.get('comment_pk')
        comment = self.ticket.comments.filter(pk=comment_pk).first()
        if comment is None:
            raise NotFound(detail="Ticket comment not found.")
        if not self.has_ticket_perm(f'{comment.comment_type}_comment.read'):
            raise PermissionDenied()
        queryset = comment.documents.all()
        return queryset


class PublicAlertMessageFilter(filters.FilterSet):
    alert_type = filters.CharFilter(method='alert_type_filter')
    scope = filters.CharFilter(method='scope_filter')

    class Meta:
        model = PublicAlertMessage
        fields = ['alert_type', 'scope']

    def alert_type_filter(self, queryset, name, value):
        if name == 'alert_type' and value is not None:
            return queryset.filter(**{name: value, })
        return queryset

    def scope_filter(self, queryset, name, value):
        if name == 'scope' and value is not None:
            return queryset.filter(**{name: value, })
        return queryset


class PublicAlertMessageView(viewsets.ModelViewSet):
    serializer_class = PublicAlertMessageSerializer
    filter_backends = [FilterListBackend]
    filter_class = PublicAlertMessageFilter

    def get_queryset(self):
        target_canonical_name = self.kwargs.get('target_canonical_name')
        try:
            target = Target.objects.get(canonical_name=target_canonical_name)
        except Target.DoesNotExist:
            raise NotFound(detail="Target not found.")
        queryset = target.alert_messages.all()
        return queryset

    def perform_create(self, serializer):
        target_canonical_name = self.kwargs.get('target_canonical_name')
        try:
            target = Target.objects.get(canonical_name=target_canonical_name)
        except Target.DoesNotExist:
            raise NotFound(detail="Target not found.")
        serializer.save(target=target, created_by=UserSerializer(self.request.user).data)


class AlertDisconnectionFilter(filters.FilterSet):
    scope = filters.CharFilter(method='scope_filter')

    class Meta:
        model = AlertDisconnection
        fields = ['scope']

    def scope_filter(self, queryset, name, value):
        if name == 'scope' and value is not None:
            return queryset.filter(**{name: value, })
        return queryset


class AlertDisconnectionsView(viewsets.ModelViewSet):
    permission_classes = (Authenticated,)
    filter_backends = [FilterListBackend]
    filterset_class = AlertDisconnectionFilter
    serializer_class = AlertDisconnectionSerializer
    queryset = AlertDisconnection.objects.all()


class TargetAlertDisconnectionsView(NestedInTargetMixin, viewsets.ModelViewSet):
    permission_classes = (Authenticated,)
    filter_backends = [FilterListBackend]
    filter_class = AlertDisconnectionFilter
    serializer_class = AlertDisconnectionSerializer

    def get_queryset(self):
        queryset = self.target.alert_disconnections.all()
        return queryset

    def perform_create(self, serializer):
        target_canonical_name = self.kwargs.get('target_canonical_name')

        # scope = serializer.data
        # if not self.has_target_perm(f'ticket.{scope}.alert_disconnection.write'):
        #     raise PermissionDenied()

        try:
            target = Target.objects.get(canonical_name=target_canonical_name)
        except Target.DoesNotExist:
            raise NotFound(detail="Target not found.")
        serializer.save(target=target, created_by=UserSerializer(self.request.user).data)


class AlertDisconnectionDocumentView(DocumentReadOnlyViewSet, DocumentUploadMixin, mixins.DestroyModelMixin):
    permission_classes = (Authenticated,)

    def get_queryset(self):
        disconnection_pk = self.kwargs.get('disconnection_pk')
        try:
            disconnection = AlertDisconnection.objects.get(pk=disconnection_pk)
        except AlertDisconnection.DoesNotExist:
            raise NotFound(detail="Alert disconnection not found.")
        queryset = disconnection.documents.all()
        return queryset

    def perform_document_create(self, file_obj, description, meta, request, type):
        doc = super().perform_document_create(file_obj, description, meta, request, type)
        disconnection_pk = self.kwargs.get('disconnection_pk')
        try:
            disconnection = AlertDisconnection.objects.get(pk=disconnection_pk)
        except AlertDisconnection.DoesNotExist:
            raise NotFound(detail="Alert disconnection not found.")
        disconnection.documents.add(doc)
        return doc

    def get_folder(self):
        disconnection_pk = self.kwargs.get('disconnection_pk')
        return f'disconnection/{disconnection_pk}'


class TargetManualAlertLogsView(NestedInTicketMixin, viewsets.ModelViewSet):
    permission_classes = (Authenticated,)
    filter_backends = [FilterListBackend]
    # filter_class = ManualAlertLog
    serializer_class = ManualAlertLogSerializer

    def get_queryset(self):
        queryset = self.target.manual_alerts.all()
        return queryset

    def perform_create(self, serializer):
        # scope = serializer.data
        # if not self.has_target_perm(f'ticket.{scope}.alert_disconnection.write'):
        #     raise PermissionDenied()

        serializer.save(target=self.target, ticket=self.ticket, created_by=UserSerializer(self.request.user).data)


class ManualAlertLogDocumentView(DocumentReadOnlyViewSet, DocumentUploadMixin, mixins.DestroyModelMixin):
    permission_classes = (Authenticated,)

    def get_queryset(self):
        manual_pk = self.kwargs.get('manual_pk')
        try:
            manual_alert_log = ManualAlertLog.objects.get(pk=manual_pk)
        except ManualAlertLog.DoesNotExist:
            raise NotFound(detail="Manual alert log not found.")
        queryset = manual_alert_log.documents.all()
        return queryset

    def perform_document_create(self, file_obj, description, meta, request):
        doc = super().perform_document_create(file_obj, description, meta, request)
        manual_pk = self.kwargs.get('manual_pk')
        try:
            manual_alert_log = ManualAlertLog.objects.get(pk=manual_pk)
        except AlertDisconnection.DoesNotExist:
            raise NotFound(detail="Manual alert log not found.")
        manual_alert_log.documents.add(doc)
        return doc

    def get_folder(self):
        manual_pk = self.kwargs.get('manual_pk')
        return f'manual/{manual_pk}'
