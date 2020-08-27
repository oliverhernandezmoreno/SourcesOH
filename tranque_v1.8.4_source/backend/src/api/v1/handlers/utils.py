import logging

from api.v1.serializers.target_serializers import (
    TimeseriesMessageSerializer, DataSourceGroupMessageSerializer,
    DataSourceMessageSerializer,
)
from documents.utils import download_docs
from targets.elastic import bulk_index, Search, search
from targets.models import Timeseries, DataSource, DataSourceGroup

logger = logging.getLogger(__name__)


def save_timeseries(timeseries, events):
    for t in timeseries:
        obj = Timeseries.objects.filter(canonical_name=t['canonical_name']).first()
        serializer = TimeseriesMessageSerializer(obj, data=t)
        if serializer.is_valid():
            serializer.save()
        else:
            logger.info(f"error processing timeseries {t['canonical_name']} {serializer.errors}")
    bulk_index(events, refresh="wait_for")


def save_groups(groups, target):
    # mapping from group -> parents canonical names
    parents_catalog = {}
    for g in groups:
        group_timeseries = g.pop('timeseries')
        parents = g.pop('parents', [])
        serializer = DataSourceGroupMessageSerializer(data=g)
        if serializer.is_valid():
            instance, _ = DataSourceGroup.objects.update_or_create(
                target=target,
                canonical_name=g['canonical_name'],
                defaults=serializer.validated_data
            )
            parents_catalog[instance] = parents
            # set timeseries group
            Timeseries.objects.filter(canonical_name__in=group_timeseries).update(data_source_group=instance)
        else:
            logger.info(f"error processing group {g['canonical_name']} {serializer.errors}")
    # set parents
    for g, parents in parents_catalog.items():
        parents = [
            p for p, _ in (
                DataSourceGroup.objects.get_or_create(target=target, canonical_name=parent)
                for parent in parents
            )
        ]
        g.parents.set(parents)
        g.save()


def get_data_source_folder(data_source):
    return f'target/{data_source.target.canonical_name}/data_source/{data_source.hardware_id}/'


def save_sources(sources, target):
    for s in sources:
        source_groups = s.pop('groups')
        source_timeseries = s.pop('timeseries')
        sheet = s.pop('sheet')
        serializer = DataSourceMessageSerializer(data=s)
        if serializer.is_valid():
            instance, _ = DataSource.objects.update_or_create(
                target=target,
                hardware_id=s['hardware_id'],
                defaults=serializer.validated_data
            )
            folder = get_data_source_folder(instance)
            # set sheet
            if sheet is not None:
                doc = next(download_docs([sheet], target.remote.bucket, folder), None)
                instance.sheet = doc
                instance.save()
            # set source groups
            instance.groups.set(
                DataSourceGroup.objects.filter(target=target, canonical_name__in=source_groups)
            )
            # set timeseries source
            Timeseries.objects.filter(canonical_name__in=source_timeseries).update(data_source=instance)
        else:
            logger.info(f"error processing source {s['hardware_id']} {serializer.errors}")


def get_events_related_data(events):
    timeseries = Timeseries.objects.filter(
        canonical_name__in=set([e['name'] for e in events])
    )
    sources_ids = set([t.data_source.id for t in timeseries if t.data_source is not None])
    groups_ids = set([t.data_source_group.id for t in timeseries if t.data_source_group is not None])
    sources = DataSource.objects.filter(id__in=sources_ids)
    groups = DataSourceGroup.objects.filter(id__in=groups_ids)
    return timeseries, sources, groups


def get_events(ids):
    s = Search().filter_by_id(ids).source("*")
    count = search(s[:0]).count
    return search(s[:count]).hits


def get_dependencies_events(events):
    trace_ids = set()
    for e in events:
        trace_ids.update(e.get('dependencies', []))
    return get_events(list(trace_ids))
