import logging

from django.contrib.auth import get_user_model
from django.db import transaction, IntegrityError
from django.utils import timezone

from alerts import engine
from alerts.models import Ticket, UserIntent, AuthorizationRequest
from api.v1.handlers.alert_utils import merge_ticket, get_ticket_bucket
from api.v1.handlers.utils import (
    save_timeseries, save_groups, save_sources,
)
from api.v1.serializers.ticket_serializers import (
    TicketMessageSerializer, AuthorizationRequestCreateSerializer, AuthorizationRequestUpdateSerializer,
)
from documents.utils import download_docs
from remotes.dispatch import handler
from targets.models import Target

logger = logging.getLogger(__name__)


@handler('alerts.ticket')
def alerts_ticket_handler(message, send):
    """
    Handle ticket update.
    """
    events = message.body.get('events')
    timeseries = message.body.get('timeseries')
    sources = message.body.get('sources')
    groups = message.body.get('groups')
    serialized_ticket = message.body.get('ticket')
    ticket_id = serialized_ticket["id"]

    logger.info(
        f'Received serialized Ticket:{ticket_id} from {message.origin}'
    )

    obj = Ticket.objects.filter(id=ticket_id)
    serializer = TicketMessageSerializer(obj, data=serialized_ticket)
    if serializer.is_valid():
        try:
            with transaction.atomic():
                target = Target.objects.get(canonical_name=serialized_ticket['target'])
                merge_ticket(serialized_ticket, target, message.origin)
                save_timeseries(timeseries, events)
                save_groups(groups, target)
                save_sources(sources, target)
                logger.info(
                    f'merged changes of Ticket:{ticket_id}'
                )
        except IntegrityError:
            logger.error(
                f'error merging serialized Ticket:{ticket_id}, ignoring'
            )
            raise
    else:
        logger.warning(
            f'invalid data in serialized Ticket:{ticket_id}, {serializer.errors}'
        )

    response = message.make_response(
        command="alerts.ticket.ack",
        body={'id': message.body['ticket']['id']}
    )
    send(response)


@handler('alerts.ticket.intent')
def alerts_ticket_intent_handler(message, send):
    """
    Execute intent sent from SMC to SML to modify state of a ticket.
    """
    issue = None
    try:
        id = message.body['id']
        canonical_name = message.body['target__canonical_name']
        serialized_user = message.body['serialized_user']
        module = message.body['module']
        content = message.body['content']
        origin = message.body['origin']
    except KeyError:
        issue = UserIntent.IssueOptions.HANDLER_ERROR
    try:
        target = Target.objects.get(canonical_name=canonical_name)
    except Target.DoesNotExist:
        issue = UserIntent.IssueOptions.HANDLER_ERROR
    if issue is None:
        try:
            user = get_user_model().objects.get(username="system")
            intent = UserIntent.objects.create(
                id=id,
                target=target,
                user=user,
                serialized_user=serialized_user,
                module=module,
                content=content,
                origin=origin,
            )

            engine.run(target, [module])

            intent.refresh_from_db()
            issue = intent.issue
        except Exception:
            issue = UserIntent.IssueOptions.ENGINE_ERROR
    send(message.make_response(
        command='alerts.ticket.intent.ack',
        body={
            "id": message.body.get('id'),
            "issue": issue,
        },
    ))


@handler('alerts.ticket.intent.ack')
def alerts_ticket_intent_ack_handler(message, send):
    """
    Saves intent execution result sent from SML to SMC to attend a remote intent.
    """
    id = message.body['id']
    issue = message.body['issue']
    intent = UserIntent.objects.get(id=id)
    intent.attended_by_destination_at = message.created_at
    intent.issue = issue
    intent.save()


@handler('alerts.ticket.authorization.create')
def alerts_ticket_authorization_create_handler(message, send):
    """
    Save authorization request sent from SML to SMC.
    """
    auth_id = message.body['id']
    assert message.body['origin'] == message.origin
    assert not AuthorizationRequest.objects.filter(id=auth_id).exists()

    serializer = AuthorizationRequestCreateSerializer(data=message.body)
    serializer.is_valid(raise_exception=True)
    serializer.save(id=auth_id)

    send(message.make_response(
        command='alerts.ticket.authorization.create.ack',
        body={
            "id": message.body.get('id'),
            "received_at": str(timezone.now()),
        },
    ))


@handler('alerts.ticket.authorization.create.ack')
def alerts_ticket_authorization_create_ack_handler(message, send):
    """
    Ack of authorization request received by SMC
    """
    id = message.body['id']
    assert AuthorizationRequest.objects.filter(id=id).exists()
    authorization_request = AuthorizationRequest.objects.get(id=id)
    authorization_request.received_at = message.body['received_at']
    authorization_request.save()


@handler('alerts.ticket.authorization.update')
def alerts_ticket_authorization_update_handler(message, send):
    """
    Save authorization request status update sent from SMC to SML.
    """
    auth_id = message.body['id']
    query = AuthorizationRequest.objects.filter(id=auth_id)
    assert query.exists()

    docs = message.body.pop('documents', [])

    serializer = AuthorizationRequestUpdateSerializer(query.first(), data=message.body)
    serializer.is_valid(raise_exception=True)
    serializer.save(id=auth_id)

    authorization_request = query.first()
    bucket = get_ticket_bucket(authorization_request.ticket)
    ticket_id = authorization_request.ticket.id
    folder = f'documents/ticket/{ticket_id}/authorization/{authorization_request.id}/'
    for doc in download_docs(docs, bucket, folder):
        authorization_request.documents.add(doc)

    if authorization_request.status == AuthorizationRequest.Status.APPROVED:
        # if approved run engine to update close conditions
        ticket = authorization_request.ticket
        engine.run(ticket.target, [ticket.module])

    send(message.make_response(
        command='alerts.ticket.authorization.update.ack',
        body={"id": message.body.get('id')},
    ))


@handler('alerts.ticket.authorization.update.ack')
def alerts_ticket_authorization_update_ack_handler(message, send):
    """
    Ack of authorization request status resolve received by SML
    """
    pass
