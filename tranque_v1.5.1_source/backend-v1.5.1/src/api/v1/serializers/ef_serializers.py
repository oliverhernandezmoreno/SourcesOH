import logging
import math

from django.db.models import Prefetch
from django.utils.functional import cached_property
from rest_framework import serializers

from api.v1.serializers.target_serializers import TimeseriesSerializerMixin
from base.fields import cached_method
from targets.models import Timeseries, Threshold, DataSource, DataSourceGroup

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
        ).prefetch_related(
            'groups',
            Prefetch(
                'timeseries',
                Timeseries.objects
                .select_related('unit', 'x_unit', 'y_unit', 'z_unit')
                .prefetch_related(Prefetch(
                    'thresholds',
                    Threshold.objects.filter(active=True),
                    to_attr='_active_thresholds'
                ))
                .filter(template_name__in=EFProfilePiezometerSerializer.TEMPLATE_NAMES),
                to_attr='prefetched_timeseries'
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
