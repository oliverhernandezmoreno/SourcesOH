from django.db.models import Prefetch
from django.utils.functional import cached_property
from rest_framework import serializers
from rest_framework_recursive.fields import RecursiveField

from api.v1.serializers.entity_serializers import WorkSiteSerializer
from api.v1.serializers.zone_serializers import ZoneSerializer
from base.serializers import CoordsSerializerMixin, get_point_deg_coords
from documents.serializers import DocumentSerializer
from remotes.models import Remote
from targets import elastic
from targets.models import (
    AcquiredProtocol,
    DataSource,
    DataSourceGroup,
    Frequency,
    MeasurementUnit,
    Target,
    TargetType,
    Timeseries,
    Threshold,
    MeasurementProtocol,
    TargetMap,
)


class MeasurementProtocolSerializer(serializers.ModelSerializer):
    class Meta:
        model = MeasurementProtocol
        fields = (
            'id',
            'description',
        )


class AcquiredProtocolSerializer(serializers.ModelSerializer):
    class Meta:
        model = AcquiredProtocol
        fields = (
            'protocol',
            'meta',
        )


class FrequencySerializer(serializers.ModelSerializer):
    class Meta:
        model = Frequency
        fields = (
            'created_at',
            'protocol',
            'minutes',
            'tolerance_lower',
            'tolerance_upper',
        )


class RemoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Remote
        fields = (
            'namespace',
            'last_seen',
        )


class TargetTypeSerialzer(serializers.ModelSerializer):
    class Meta:
        model = TargetType
        fields = '__all__'


class TargetSerializer(CoordsSerializerMixin, serializers.ModelSerializer):
    zone = ZoneSerializer(read_only=True)
    work_sites = WorkSiteSerializer(read_only=True, many=True)
    remote = RemoteSerializer(read_only=True, many=False)
    type_description = serializers.SlugRelatedField(read_only=True, slug_field='description', source='type')
    state_description = serializers.SlugRelatedField(read_only=True, slug_field='description', source='state')

    class Meta:
        model = Target
        fields = '__all__'


class TargetTicketDataSerializer(serializers.ModelSerializer):
    zone = ZoneSerializer(read_only=True)
    work_sites = WorkSiteSerializer(read_only=True, many=True)

    class Meta:
        model = Target
        fields = ['id', 'canonical_name', 'name', 'zone', 'work_sites']


class ThresholdSerializer(serializers.ModelSerializer):
    class Meta:
        model = Threshold
        fields = ['upper', 'lower', 'kind']


class MeasurementUnitSerializer(serializers.ModelSerializer):
    class Meta:
        model = MeasurementUnit
        fields = '__all__'


class TimeseriesSerializerMixin(serializers.Serializer):
    events = serializers.SerializerMethodField()
    thresholds = ThresholdSerializer(many=True, read_only=True, source='active_thresholds')
    unit = MeasurementUnitSerializer(read_only=True)
    x_unit = MeasurementUnitSerializer(read_only=True)
    y_unit = MeasurementUnitSerializer(read_only=True)
    z_unit = MeasurementUnitSerializer(read_only=True)
    acquired_protocols = AcquiredProtocolSerializer(many=True, read_only=True, source='active_acquired_protocols')
    frequencies = FrequencySerializer(many=True, read_only=True, source='active_frequencies')
    category = serializers.SerializerMethodField()
    target_canonical_name = serializers.SlugRelatedField(read_only=True, slug_field='canonical_name', source='target')

    def get_events(self, ts):
        return ts.get_events(0, self.context.get('max_events', 0))

    def get_category(self, ts):
        from targets.profiling import FOREST
        return [
            category
            for nested in (
                t.value.category
                if isinstance(t.value.category, (tuple, list))
                else (t.value.category,)
                for t in FOREST.values()
                if t.value.canonical_name == ts.template_name
            )
            for category in nested
            if category is not None
        ]


class TimeseriesSerializer(serializers.ModelSerializer, TimeseriesSerializerMixin):
    data_source_name = serializers.SlugRelatedField(read_only=True, slug_field='name', source='data_source')

    @staticmethod
    def get_queryset():
        queryset = Timeseries.objects.all().select_related(
            'unit', 'x_unit', 'y_unit', 'z_unit',
            'target', 'data_source__target', 'data_source_group__target'
        )
        thresholds_prefetch = Prefetch(
            'thresholds',
            queryset=Threshold.objects.filter(active=True),
            to_attr='_active_thresholds'
        )
        protocols_prefetch = Prefetch(
            'acquired_protocols',
            queryset=AcquiredProtocol.objects.filter(active=True),
            to_attr='_active_acquired_protocols'
        )
        queryset = queryset.prefetch_related(
            'inputs', thresholds_prefetch, 'frequencies', protocols_prefetch, 'data_source__groups',
            'data_source_group__parents'
        )
        return queryset

    class Meta:
        model = Timeseries
        exclude = ('script', 'documents')


class DataSourceSerializer(CoordsSerializerMixin, serializers.ModelSerializer):
    groups = serializers.SlugRelatedField(many=True, read_only=True, slug_field='canonical_name')
    group_names = serializers.SlugRelatedField(many=True, read_only=True, source='groups', slug_field='name')
    sheet = DocumentSerializer(read_only=True)

    class Meta:
        model = DataSource
        exclude = ('target',)


class DataSourceGroupDetailSerializer(serializers.ModelSerializer):
    target = serializers.SlugRelatedField(read_only=True, slug_field='canonical_name')
    data_sources = DataSourceSerializer(many=True)
    parents = serializers.SlugRelatedField(many=True, read_only=True, slug_field='canonical_name')

    class Meta:
        model = DataSourceGroup
        fields = '__all__'


class DataSourceGroupListSerializer(serializers.ModelSerializer):
    target = serializers.SlugRelatedField(read_only=True, slug_field='canonical_name')

    class Meta:
        model = DataSourceGroup
        fields = '__all__'


class TimeseriesListSerializer(serializers.ModelSerializer, TimeseriesSerializerMixin):
    data_source = DataSourceSerializer()
    data_source_group = DataSourceGroupListSerializer()

    class Meta:
        model = Timeseries
        exclude = ('script', 'documents')

    @cached_property
    def timeseries_events(self):
        max_events = self.context.get('max_events', 0)
        return {
            t.pk: hits
            for hits, t in zip(
                map(lambda result: result.hits, elastic.msearch([
                    t.events_search()[:max_events]
                    for t in self.instance
                ]))
                if max_events > 0
                else [[] for _ in self.instance],
                self.instance,
            )
        }

    def get_events(self, ts):
        return self.timeseries_events.get(ts.pk)


def create_protocols_for_data(data):
    ret = []
    for x in data:
        if 'protocol' in x and x['protocol'] is not None:
            protocol, created = MeasurementProtocol.objects.get_or_create(
                id=x['protocol']['id'], defaults=x['protocol']
            )
            ret.append({**x, 'protocol': protocol})
        else:
            ret.append(x)
    return ret


class AcquiredProtocolMessageSerializer(AcquiredProtocolSerializer):
    protocol = MeasurementProtocolSerializer()


class MeasurementUnitMessageSerializer(MeasurementUnitSerializer):
    si_unit = RecursiveField(allow_null=True)

    class Meta(MeasurementUnitSerializer.Meta):
        validators = []
        extra_kwargs = {
            'id': {
                'validators': [],
            },
        }


class FrequencyMessageSerializer(FrequencySerializer):
    protocol = MeasurementProtocolSerializer(allow_null=True)


def get_or_create_unit(unit_data):
    if unit_data is None or 'id' not in unit_data:
        return None
    if MeasurementUnit.objects.filter(id=unit_data['id']).exists():
        return MeasurementUnit.objects.get(id=unit_data['id'])
    else:
        si_unit_data = unit_data.pop('si_unit')
        si_unit = get_or_create_unit(si_unit_data)
        unit, created = MeasurementUnit.objects.get_or_create(
            id=unit_data['id'],
            defaults={**unit_data, 'si_unit': si_unit},
        )
        return unit


class TimeseriesMessageSerializer(serializers.ModelSerializer):
    """
    Timeseries serializer to use in SML->SMC messages,
    nested serialized objects are writable to validate data structure
    but receive an empty queryset to not check against existing rows.
    to prevent data duplication on update all related data will be recreated.
    """
    thresholds = ThresholdSerializer(many=True, source='active_thresholds')
    unit = MeasurementUnitMessageSerializer(allow_null=True)
    x_unit = MeasurementUnitMessageSerializer(allow_null=True)
    y_unit = MeasurementUnitMessageSerializer(allow_null=True)
    z_unit = MeasurementUnitMessageSerializer(allow_null=True)
    acquired_protocols = AcquiredProtocolMessageSerializer(many=True, source='active_acquired_protocols')
    frequencies = FrequencyMessageSerializer(many=True, source='active_frequencies')

    target = serializers.SlugRelatedField(slug_field='canonical_name', queryset=Target.objects.all())

    class Meta:
        model = Timeseries
        exclude = ('id', 'data_source', 'data_source_group', 'inputs', 'documents')

    def update_or_create_timeseries(self, instance, validated_data):
        thresholds_data = validated_data.pop('active_thresholds')
        acquired_protocols_data = validated_data.pop('active_acquired_protocols')
        frequencies_data = validated_data.pop('active_frequencies')

        unit = get_or_create_unit(validated_data.pop('unit'))
        x_unit = get_or_create_unit(validated_data.pop('x_unit'))
        y_unit = get_or_create_unit(validated_data.pop('y_unit'))
        z_unit = get_or_create_unit(validated_data.pop('z_unit'))

        if instance is None:
            timeseries = Timeseries.objects.create(
                **validated_data,
                unit=unit,
                x_unit=x_unit,
                y_unit=y_unit,
                z_unit=z_unit,
            )
        else:
            Threshold.objects.filter(timeseries=instance).delete()
            Frequency.objects.filter(timeseries=instance).delete()
            AcquiredProtocol.objects.filter(timeseries=instance).delete()
            instance.unit = unit
            instance.x_unit = x_unit
            instance.y_unit = y_unit
            instance.z_unit = z_unit
            timeseries = super().update(instance, validated_data)

        Threshold.objects.bulk_create([Threshold(**t, timeseries=timeseries) for t in thresholds_data])

        frequencies = create_protocols_for_data(frequencies_data)
        Frequency.objects.bulk_create([Frequency(**f, timeseries=timeseries) for f in frequencies])

        acquired_protocols = create_protocols_for_data(acquired_protocols_data)
        AcquiredProtocol.objects.bulk_create(
            [AcquiredProtocol(**a, timeseries=timeseries, active=True) for a in acquired_protocols])

        return timeseries

    def create(self, validated_data):
        return self.update_or_create_timeseries(None, validated_data)

    def update(self, instance, validated_data):
        return self.update_or_create_timeseries(instance, validated_data)


class DataSourceGroupMessageSerializer(serializers.ModelSerializer):
    timeseries = serializers.SlugRelatedField(read_only=True, many=True, slug_field='canonical_name')
    parents = serializers.SlugRelatedField(read_only=True, many=True, slug_field='canonical_name')

    class Meta:
        model = DataSourceGroup
        exclude = ('id', 'target')


class DataSourceMessageSerializer(serializers.ModelSerializer):
    timeseries = serializers.SlugRelatedField(read_only=True, many=True, slug_field='canonical_name')
    groups = serializers.SlugRelatedField(read_only=True, many=True, slug_field='canonical_name')
    sheet = serializers.SerializerMethodField()

    class Meta:
        model = DataSource
        exclude = ('id', 'target')

    def get_sheet(self, obj):
        if obj.sheet is None:
            return None
        docs = self.context.get('documents', [])
        return next(
            (doc[2] for doc in docs if doc[0] == obj.sheet.id),
            None
        )


class TargetMapSerializer(serializers.ModelSerializer):
    lower_left_deg_coords = serializers.SerializerMethodField()
    upper_right_deg_coords = serializers.SerializerMethodField()
    image_width = serializers.SerializerMethodField()
    image_height = serializers.SerializerMethodField()
    target = serializers.SlugRelatedField(read_only=True, slug_field='canonical_name')

    def get_image_width(self, obj):
        if not obj.image:
            return 0
        return obj.image.width

    def get_image_height(self, obj):
        if not obj.image:
            return 0
        return obj.image.height

    def get_lower_left_deg_coords(self, obj):
        return get_point_deg_coords(obj.lower_left_coords)

    def get_upper_right_deg_coords(self, obj):
        return get_point_deg_coords(obj.upper_right_coords)

    class Meta:
        model = TargetMap
        fields = (
            'lower_left_deg_coords',
            'upper_right_deg_coords',
            'target',
            'id',
            'name',
            'canonical_name',
            'image',
            'image_width',
            'image_height'
        )
