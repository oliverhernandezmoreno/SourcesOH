from django.db.models import Q
from django_filters import rest_framework as filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import mixins, viewsets

from api.public.serializers.target_serializers import TargetSerializer, TargetDetailSerializer
from base.filters import FilterListBackend, SlugifiedFilter
from base.mixins import ListCountMixin
from targets.models import Target
from targets.models import Timeseries
from targets.models import DataSource


class TargetFilter(filters.FilterSet):

    name = SlugifiedFilter(field_name="canonical_name", lookup_expr="contains")
    zone = SlugifiedFilter(
        field_name="zone__natural_name",
        lookup_expr="contains",
        help_text="The name of the zone the target is in (commune, province, region)",
    )
    zone_nk = filters.CharFilter(
        field_name="zone__natural_name",
        help_text="Exact natural key of the zone the target is in",
    )
    type = SlugifiedFilter(field_name="type")
    state = SlugifiedFilter(field_name="state")

    class Meta:
        model = Target
        fields = [
            "name",
            "zone",
            "type",
            "state",
        ]


class TargetView(ListCountMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    """
    retrieve:
    Returns a single target.

    list:
    Returns a paginated list of targets.
    """

    lookup_field = "canonical_name"
    lookup_value_regex = "[^/]+"
    queryset = Target.objects.select_related("zone").prefetch_related('data_sources').all()
    filter_backends = [FilterListBackend]
    filter_class = TargetFilter

    def get_serializer_class(self):
        if self.action == "retrieve":
            return TargetDetailSerializer
        return TargetSerializer

    def mvp_view(self, **filters):
        target = self.get_object()
        dss = DataSource.objects.filter(**{
            **filters,
            "target": target,
        })
        ts = [
            {
                "canonical_name": t.canonical_name,
                "title": t.data_source.name,
                "events": t.get_events(0, 20),
                "unit": ({
                    "abbreviation": t.unit.abbreviation,
                    "name": t.unit.name,
                } if t.unit else None),
                "thresholds": t.active_thresholds.order_by('upper').values_list('upper', flat=True)
            }
            for t in Timeseries.objects.filter(
                Q(type=Timeseries.TimeseriesType.RAW) | Q(type=Timeseries.TimeseriesType.MANUAL),
                data_source__in=dss,
                target=target,
            )
        ]
        return Response(data=ts)

    @action(methods=["get"], detail=True, url_path="mvp/presion")
    def mvp_presion(self, *args, **kwargs):
        return self.mvp_view(groups__canonical_name="piezometros")

    @action(methods=["get"], detail=True, url_path="mvp/turbiedad")
    def mvp_turbiedad(self, *args, **kwargs):
        return self.mvp_view(groups__canonical_name="turbidimetros")
