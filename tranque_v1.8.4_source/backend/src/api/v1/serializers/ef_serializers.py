import logging
import math

from django.utils.functional import cached_property
from rest_framework import serializers

from api.v1.serializers.target_serializers import (
    TimeseriesSerializerMixin,
    ThresholdSerializer,
    MeasurementUnitSerializer
)
from base.fields import cached_method
from targets.models import Timeseries, DataSource, DataSourceGroup

logger = logging.getLogger(__name__)


class EFProfileTimeseriesSerializer(serializers.ModelSerializer, TimeseriesSerializerMixin):
    """This timeseries serializer expects the 'date_to' context and
    optionally the 'coords_override' context.

    The 'date_to' context is used as a parameter to the
    Timeseries.get_head method, for populating events.

    The optional 'coords_override' context, if given, will replace the
    'coords' field of each of the given events in 'head'.

    """

    events = serializers.SerializerMethodField()

    class Meta:
        model = Timeseries
        fields = (
            'name', 'canonical_name', 'template_name', 'description',
            'active', 'thresholds', 'unit', 'x_unit', 'y_unit', 'z_unit',
            'category', 'events'
        )

    def get_events(self, ts):
        return [
            {
                **event,
                'coords': self.context.get('coords_override', event.get('coords', {}))
            }
            for event in ts.get_head(date_to=self.context.get('date_to'))
        ]


class EFProfilePiezometerSerializer(serializers.ModelSerializer):
    """This DataSource serializer expects a 'coordinates_reference'
    context and optionally the 'date_to' context.

    The 'coordinates_reference' context is a 4-tuple of coordinates
    (xi, yi, xf, yf) which will be used to compute a relative
    coordinate for the source itself, based on its 'coords' field.

    The optional 'date_to' context is used to filter the head events
    query, to be serialized within the 'timeseries' field.

    """

    TEMPLATE_NAMES = ('ef-mvp.m2.parameters.presion-poros',)

    GROUP_CANONICAL_NAME = 'piezometros'

    timeseries = serializers.SerializerMethodField()
    groups = serializers.SlugRelatedField(many=True, read_only=True, slug_field='canonical_name')

    class Meta:
        model = DataSource
        exclude = ('target',)

    @cached_method
    def timeseries_queryset(self, source):
        if hasattr(source, 'prefetched_timeseries'):
            return source.prefetched_timeseries
        return (
            source.timeseries
            .select_related('unit')
            .filter(template_name__in=self.TEMPLATE_NAMES)
        )

    def get_timeseries(self, source):
        return EFProfileTimeseriesSerializer(
            self.timeseries_queryset(source),
            many=True,
            context={
                'date_to': self.context.get('date_to'),
                'coords_override': self.get_relative_coords(source),
            }
        ).data

    def relative_x_coord(self, source):
        if source.coords is None:
            return None
        reference = self.context.get('coordinates_reference')
        if reference is None:
            return None
        x, y = source.coords.get('x'), source.coords.get('y')
        if x is None or y is None:
            return None
        try:
            xi, yi, xf, yf = reference
            d3 = math.sqrt((xf - xi) ** 2 + (yf - yi) ** 2)
            if d3 == 0:
                logger.warn('reference points are equal')
                return {}
            d2sq = (xf - x) ** 2 + (yf - y) ** 2
            d1sq = (xi - x) ** 2 + (yi - y) ** 2
            return d3 / 2 + (d1sq - d2sq) / 2 / d3
        except (ValueError, TypeError) as e:
            logger.exception(e)
            return None

    def get_relative_coords(self, source):
        x = self.relative_x_coord(source)
        return {
            **({'x': x} if x is not None else {}),
        }


class EFTopographyProfileSerializer(serializers.ModelSerializer):
    """This DataSource serializer expects a 'request' context and a
    'kwargs' context, both coming from a standard GenericViewSet.

    """

    TEMPLATE_NAMES = (
        'ef-mvp.m2.parameters.variables.elevacion',
        'ef-mvp.m2.parameters.variables.perfil-suelo-fundacion',
    )
    COORDINATES_TEMPLATE_NAME = 'ef-mvp.m2.parameters.variables.elevacion'

    GROUP_CANONICAL_NAME = 'perfil-transversal'

    timeseries = serializers.SerializerMethodField()
    projected_sources = serializers.SerializerMethodField()
    groups = serializers.SlugRelatedField(many=True, read_only=True, slug_field='canonical_name')

    class Meta:
        model = DataSource
        exclude = ('target',)

    def date_to_parameter(self):
        if 'request' not in self.context:
            return None
        return self.context['request'].query_params.get('date_to')

    @cached_method
    def timeseries_queryset(self, source):
        return (
            source.timeseries
            .select_related('unit')
            .filter(template_name__in=self.TEMPLATE_NAMES)
        )

    def get_timeseries(self, source):
        return EFProfileTimeseriesSerializer(
            self.timeseries_queryset(source),
            many=True,
            context={'date_to': self.date_to_parameter()}
        ).data

    def get_coordinates_reference(self, source):
        ts = self.timeseries_queryset(source).filter(template_name=self.COORDINATES_TEMPLATE_NAME).first()
        if ts is None:
            return None
        meta = next(iter(ts.get_head(date_to=self.date_to_parameter())), {}).get('meta', {})
        if meta is None:
            return None
        else:
            return meta.get('coordinates')

    @cached_property
    def projected_sources_queryset(self):
        return DataSource.objects.filter(
            target__canonical_name=self.context.get('kwargs', {}).get('target_canonical_name'),
            groups__in=DataSourceGroup.objects.filter(
                target__canonical_name=self.context.get('kwargs', {}).get('target_canonical_name'),
                canonical_name=EFProfilePiezometerSerializer.GROUP_CANONICAL_NAME
            )
        )

    def get_projected_sources(self, source):
        return EFProfilePiezometerSerializer(
            self.projected_sources_queryset,
            many=True,
            context={
                'coordinates_reference': self.get_coordinates_reference(source),
                'date_to': self.date_to_parameter()
            },
        ).data


class EFDepthDeformationSerializer(serializers.ModelSerializer):
    """This DataSource serializer expects a 'request' context and a
    'kwargs' context, both coming from a standard GenericViewSet.

    """

    GROUP_CANONICAL_NAME = 'inclinometros'

    inclinometer = serializers.SerializerMethodField()

    class Meta:
        model = DataSourceGroup
        # exclude = ('target',)
        fields = ('inclinometer',)

    def date_to_parameter(self):
        if 'request' not in self.context:
            return None
        return self.context['request'].query_params.get('date_to')

    def get_inclinometer(self, source_group):
        # One DepthDeformation per measurement point depth is obtained from hardware_id
        return EFInclinometerDeformationSerializer(
            source_group,
            context={'date_to': self.date_to_parameter()}
        ).data


class EFInclinometerDeformationSerializer(serializers.ModelSerializer):
    """This DataSourceGroup serializer takes an optional 'date_to'
    context, that is used to filter the head events
    query, to be serialized by the EFInclinometerPointDeformationSerializer.
    """

    inclinometer_points = serializers.SerializerMethodField()
    unit = serializers.SerializerMethodField()

    class Meta:
        model = DataSourceGroup
        exclude = ('target',)

    def inclinometer_points_queryset(self, source_group):
        return DataSource.objects.filter(
            groups__in=[source_group],
        )

    def get_inclinometer_points(self, source_group):
        points = EFInclinometerPointDeformationSerializer(
            self.inclinometer_points_queryset(source_group),
            many=True,
            context={'date_to': self.context.get('date_to')}
        ).data
        return points

    def get_unit(self, source_group):
        sample_ts = Timeseries.objects.filter(
            template_name__in=EFInclinometerPointDeformationSerializer.TEMPLATE_NAMES
        ).select_related('unit').first()
        unit = sample_ts.unit
        return MeasurementUnitSerializer(unit).data


class EFInclinometerPointDeformationSerializer(serializers.ModelSerializer):
    """This DataSource serializer returns {x, y, z} of deformation for
    a particular inclinometer point. The z value is taken from the
    last number in the canonical_name, e.g., 100 for 'iz-01-100'

    The optional 'date_to' context is used to filter the head events
    query.

    """

    TEMPLATE_NAMES = (
        'ef-mvp.m2.parameters.deformacion-inclinometro-z-eje-x',
        'ef-mvp.m2.parameters.deformacion-inclinometro-z-eje-y',
    )

    values = serializers.SerializerMethodField()
    thresholds = serializers.SerializerMethodField()

    class Meta:
        model = DataSource
        fields = ('values', 'thresholds',)

    def timeseries_queryset(self, source):
        return (
            source.timeseries
            .filter(template_name__in=self.TEMPLATE_NAMES)
        )

    def get_values(self, source):
        data = {}
        z_coord = source.canonical_name.split('-')[-1]
        data['z'] = float(z_coord)
        timeseries = self.timeseries_queryset(source)
        for ts in timeseries:
            template = ts.template_name
            coord = template.split('-')[-1]
            head = ts.get_head(date_to=self.context.get('date_to'))
            data[coord] = head[0]['value'] if len(head) > 0 else None
        return data

    def get_thresholds(self, source):
        timeseries = self.timeseries_queryset(source)
        threshold_data = {}
        for ts in timeseries:
            template = ts.template_name
            coord = template.split('-')[-1]
            threshold_data[coord] = ThresholdSerializer(ts.thresholds.all(), many=True, source='active_thresholds').data
        return threshold_data
