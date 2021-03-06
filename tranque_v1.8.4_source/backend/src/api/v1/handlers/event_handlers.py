import json
import logging
import tempfile
from pathlib import Path

from botocore.exceptions import ClientError
from django.conf import settings
from django.core.files import File

from api.v1.handlers.utils import save_timeseries, get_events_related_data, save_groups, save_sources
from api.v1.serializers.target_serializers import (
    DataSourceGroupMessageSerializer,
    DataSourceMessageSerializer,
    TimeseriesMessageSerializer,
)
from documents.utils import serialize_docs_for_upload
from remotes.dispatch import handler, send_simple_smc_message
from remotes.models import EventTraceRequest, DataRequestState, DataDumpRequest
from remotes.storage import get_s3_bucket
from targets.elastic import bulk_index, get_trace, Search, scan
from targets.models import Timeseries, DataSource, DataSourceGroup

logger = logging.getLogger(__name__)


def send_data_to_smc(timeseries, events):
    body = {
        'timeseries': TimeseriesMessageSerializer(timeseries, many=True).data,
        'events': events
    }
    send_simple_smc_message(settings.AUTO_DELIVER_COMMAND, body)


@handler(settings.AUTO_DELIVER_COMMAND)
def remotes_auto_deliver(message, send):
    """
    Handle data sent from a SML to a SMC.
    """
    timeseries = message.body['timeseries']
    events = message.body['events']
    logger.info(f"Received {len(timeseries)} timeseries and {len(events)} events from {message.origin}")
    save_timeseries(timeseries, events)


@handler('remote.event.trace.request')
def remote_event_trace_request(message, send):
    """
    Handle event trace request sent from a SMC to a SML.
    """
    events = get_trace(message.body['event_id'])['trace']
    timeseries, sources, groups = get_events_related_data(events)

    target = timeseries[0].target
    bucket = get_s3_bucket()
    folder = f'target/{target.canonical_name}/trace_request/{message.body["event_id"]}/'
    sheets = [s.sheet for s in sources if s.sheet is not None]
    documents = list(serialize_docs_for_upload(sheets, folder))
    for _, doc, serialized_doc in documents:
        bucket.upload(doc.file, serialized_doc['file'])

    send(message.make_response(
        command="remote.event.trace.response",
        body={
            'events': events,
            'timeseries': TimeseriesMessageSerializer(timeseries, many=True).data,
            'sources': DataSourceMessageSerializer(sources, many=True, context={'documents': documents}).data,
            'groups': DataSourceGroupMessageSerializer(groups, many=True).data,
            'request_id': message.body['request_id']
        },
    ))


@handler('remote.event.trace.response')
def remote_event_trace_response(message, send):
    """
    Handle event trace response sent from a SML to a SMC.
    """
    timeseries = message.body['timeseries']
    events = message.body['events']
    sources = message.body['sources']
    groups = message.body['groups']
    request_id = message.body['request_id']

    trace_request = EventTraceRequest.objects.get(id=request_id)

    name_in_log = f'"{trace_request.timeseries.canonical_name}:{trace_request.event_id}"'
    logger.info(
        f'Received trace of {name_in_log} from {message.origin} in response to request {request_id}'
    )
    logger.info(
        f'Trace of "{name_in_log}" contains {len(timeseries)} timeseries and {len(events)} events'
    )
    # TODO
    #  filter events not in head event dependencies
    #  filter timeseries not in events
    save_timeseries(timeseries, events)

    target = trace_request.timeseries.target
    save_groups(groups, target)
    save_sources(sources, target)

    trace_request.received_at = message.created_at
    trace_request.state = DataRequestState.RECEIVED
    trace_request.save()


def upload_dump_to_smc(dump_id, timeseries, events, groups, sources):
    """
    Upload dump data to the SMC s3 storage
    Upload two files, one for serialized timeseries, and one for events
    """

    bucket = get_s3_bucket()

    dump_dir = f'dump/{dump_id}'

    timeseries_path = f'{dump_dir}/timeseries.json'
    events_path = f'{dump_dir}/events.ndjson'
    sources_path = f'{dump_dir}/sources.json'
    groups_path = f'{dump_dir}/groups.json'

    # Create temporary folder to open and close files in different modes
    with tempfile.TemporaryDirectory() as tmpdir:
        ts_tmp_path = Path(tmpdir) / 'timeseries.json'
        e_tmp_path = Path(tmpdir) / 'events.ndjson'
        s_tmp_path = Path(tmpdir) / 'sources.json'
        g_tmp_path = Path(tmpdir) / 'groups.json'

        # Open files in write-string mode to dump json data
        sheets = [s.sheet for s in sources if s.sheet is not None]
        documents = list(serialize_docs_for_upload(sheets, f'{dump_dir}/sources'))
        with open(ts_tmp_path, 'w') as ts_tmp, \
                open(e_tmp_path, 'w') as e_tmp, \
                open(g_tmp_path, 'w') as g_tmp, \
                open(s_tmp_path, 'w') as s_tmp:
            json.dump(TimeseriesMessageSerializer(timeseries, many=True).data, ts_tmp)
            for e in events:
                e_tmp.write(json.dumps(e))
                e_tmp.write('\n')
            json.dump(DataSourceGroupMessageSerializer(groups, many=True).data, g_tmp)
            json.dump(DataSourceMessageSerializer(sources, many=True, context={'documents': documents}).data, s_tmp)
        for _, doc, serialized_doc in documents:
            bucket.upload(doc.file, serialized_doc['file'])

        # Open files in read-bytes mode to upload them using boto3
        with open(ts_tmp_path, 'rb') as ts_tmp, \
                open(e_tmp_path, 'rb') as e_tmp, \
                open(g_tmp_path, 'rb') as g_tmp, \
                open(s_tmp_path, 'rb') as s_tmp:
            try:
                bucket.upload(File(ts_tmp), timeseries_path)
                bucket.upload(File(e_tmp), events_path)
                bucket.upload(File(g_tmp), groups_path)
                bucket.upload(File(s_tmp), sources_path)
            except ClientError as e:
                logging.error(e)
                raise e

    return {
        "timeseries": timeseries_path,
        "events": events_path,
        "sources": sources_path,
        "groups": groups_path
    }


@handler('remote.target.data.dump.request')
def remote_target_data_dump_request(message, send):
    """
    Handle data dump request sent from a SMC to a SML.
    """
    r_id = message.body["request_id"]
    profile = message.body["profile"]
    target = message.body["target"]
    logger.info(
        f'Received dump request {r_id} for "{profile}" profile of target {target}'
    )
    timeseries = Timeseries.objects.filter(
        target__canonical_name=target,
        template_name__startswith=profile,
    )
    source_objs = list(filter(bool, [t.data_source for t in timeseries]))
    source_ids = set([s.id for s in source_objs])
    groups_ids = set([group.id for source in source_objs for group in source.groups.all()])
    groups = DataSourceGroup.objects.filter(id__in=groups_ids)
    sources = DataSource.objects.filter(id__in=source_ids)
    s = Search() \
        .filter_by_name([t.canonical_name for t in timeseries]) \
        .filter_by_timestamp_range("gte", message.body['date_from']) \
        .filter_by_timestamp_range("lte", message.body['date_to']) \
        .source("*")
    events = scan(s)
    logger.info(
        f'Uploading dump files for {r_id}'
    )
    paths = upload_dump_to_smc(r_id, timeseries, events, groups, sources)

    send(message.make_response(
        command="remote.target.data.dump.response",
        body={
            'paths': paths,
            'request_id': r_id
        },
    ))


def store_dump_files(request_id, tmp_paths):
    """
    Move SML uploaded dump files to SMC bucket and add the respective file reference to DataDumpRequest
    """
    request = DataDumpRequest.objects.get(id=request_id)
    bucket = get_s3_bucket(target_bucket=request.target.remote.bucket)

    base_path = f'dumps/{request.target.canonical_name}/{request.id}/'
    new_timeseries_path = f'{base_path}timeseries.json'
    new_events_path = f'{base_path}events.ndjson'
    new_sources_path = f'{base_path}sources.json'
    new_groups_path = f'{base_path}groups.json'

    paths = [
        (tmp_paths['timeseries'], new_timeseries_path),
        (tmp_paths['events'], new_events_path),
        (tmp_paths['groups'], new_groups_path),
        (tmp_paths['sources'], new_sources_path)
    ]
    download_ok = True
    for old_path, new_path in paths:
        download_ok = download_ok and bucket.download(old_path, new_path)

    # save and add to instance collection
    if download_ok:
        request.events_file = new_events_path
        request.timeseries_file = new_timeseries_path
        request.groups_file = new_groups_path
        request.sources_file = new_sources_path
        request.save()
    return request


@handler('remote.target.data.dump.response')
def remote_target_data_dump_response(message, send):
    """
    Handle data dump response sent from a SML to a SMC.
    """
    logger.info(
        f'Received dump from {message.origin} in response to request {message.body["request_id"]}'
    )

    dump_request = store_dump_files(message.body['request_id'], message.body['paths'])

    timeseries = json.load(dump_request.timeseries_file)
    events_count = 0
    events_batch = []
    for line in dump_request.events_file:
        events_batch.append(json.loads(line))
        if len(events_batch) == 100:
            bulk_index(events_batch, refresh="wait_for")
            events_count += 100
            events_batch = []
    if len(events_batch) > 0:
        bulk_index(events_batch, refresh="wait_for")
        events_count += len(events_batch)

    sources = json.load(dump_request.sources_file)
    groups = json.load(dump_request.groups_file)

    logger.info(
        f'Dump "{message.body["request_id"]}" contains ' +
        f'{len(timeseries)} timeseries, {events_count} events, {len(groups)} groups, {len(sources)} sources'
    )

    save_timeseries(timeseries, [])

    # save groups
    save_groups(groups, dump_request.target)
    # save sources
    save_sources(sources, dump_request.target)

    dump_request.received_at = message.created_at
    dump_request.state = DataRequestState.RECEIVED
    dump_request.save()

    logger.info(
        f'Dump "{message.body["request_id"]}" stored'
    )
