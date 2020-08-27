import logging

from django.conf import settings

from alerts.models import TicketLog, TicketComment, Ticket
from api.v1.handlers.utils import (
    get_events, get_events_related_data,
)
from api.v1.serializers.target_serializers import (
    TimeseriesMessageSerializer, DataSourceMessageSerializer,
    DataSourceGroupMessageSerializer,
)
from api.v1.serializers.ticket_serializers import (
    TicketMessageSerializer, TicketLogMessageSerializer,
    TicketCommentMessageSerializer,
)
from documents.utils import download_docs, serialize_docs_for_upload, upload_docs
from remotes.models import Remote

logger = logging.getLogger(__name__)

LOGS = 'logs'
COMMENTS = 'comments'


def get_ticket_events(ticket):
    ids = list(set(get_ticket_events_ids(ticket)))
    return get_events(ids)


def get_ticket_events_ids(ticket):
    for log in ticket.logs.all():
        for ts in (getattr(log, 'timeseries', []) or []):
            for e in ts.get('events', []):
                yield e
    for child in ticket.children.all():
        yield from get_ticket_events_ids(child)


def get_ticket_folder(ticket):
    return f'target/{ticket.target.canonical_name}/ticket/{ticket.id}/'


def get_ticket_related_folder(ticket, obj, obj_str):
    return f'{get_ticket_folder(ticket)}{obj_str}/{obj.id}/'


def get_ticket_documents(ticket):
    for log in ticket.logs.all():
        yield from serialize_docs_for_upload(log.documents.all(), get_ticket_related_folder(ticket, log, LOGS))
    for comment in ticket.comments.all():
        docs = comment.documents.all()
        yield from serialize_docs_for_upload(docs, get_ticket_related_folder(ticket, comment, COMMENTS))
    for child in ticket.children.all():
        yield from get_ticket_documents(child)


def get_ticket_bucket(ticket):
    if settings.STACK_IS_SML:
        return settings.SMC_S3_BUCKET_NAME
    else:
        if ticket.target.remote is None:
            raise Remote.DoesNotExist()
        return ticket.target.remote.bucket


def save_related(serialized_obj, ticket, bucket, obj_class, obj_serializer, obj_str):
    if obj_class.objects.filter(id=serialized_obj['id']).exists():
        # logs and comments are not editable
        return
    docs = serialized_obj.pop('documents', [])

    serializer = obj_serializer(data=serialized_obj)
    serializer.is_valid(raise_exception=True)

    obj = obj_class.objects.create(**serialized_obj, ticket=ticket)

    for doc in download_docs(docs, bucket, get_ticket_related_folder(ticket, obj, obj_str)):
        obj.documents.add(doc)


def merge_ticket(serialized_ticket, target, origin):
    children = serialized_ticket.pop('children', [])
    logs = serialized_ticket.pop('logs', [])
    comments = serialized_ticket.pop('comments', [])
    ticket, created = Ticket.objects.get_or_create(
        id=serialized_ticket['id'],
        defaults={
            **serialized_ticket,
            'target': target,
            'propagated': True,
        }
    )
    if not created and origin == ticket.origin:
        # only save changes to ticket object if message comes from ticket origin
        serializer = TicketMessageSerializer(ticket, data=serialized_ticket)
        if serializer.is_valid():
            ticket = serializer.save()
    bucket = get_ticket_bucket(ticket)
    for log in logs:
        save_related(log, ticket, bucket, TicketLog, TicketLogMessageSerializer, LOGS)
    for comment in comments:
        save_related(comment, ticket, bucket, TicketComment, TicketCommentMessageSerializer, COMMENTS)
    for child in children:
        merged_child = merge_ticket(child, target, origin)
        if not ticket.children.filter(id=merged_child.id).exists():
            ticket.children.add(merged_child)
    return ticket


def prepare_ticket_message_body(ticket):
    """This will upload documents to intermediate storage """
    bucket = get_ticket_bucket(ticket)
    events = get_ticket_events(ticket)
    timeseries, sources, groups = get_events_related_data(events)
    documents = list(get_ticket_documents(ticket))
    serialized_ticket = TicketMessageSerializer(ticket, context={'documents': documents}).data
    upload_docs(documents, bucket)
    return {
        'events': events,
        'timeseries': TimeseriesMessageSerializer(timeseries, many=True).data,
        'sources': DataSourceMessageSerializer(sources, many=True).data,
        'groups': DataSourceGroupMessageSerializer(groups, many=True).data,
        'ticket': serialized_ticket
    }
