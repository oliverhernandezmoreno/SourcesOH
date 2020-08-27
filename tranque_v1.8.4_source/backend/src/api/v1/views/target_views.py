import tempfile

from django.http import FileResponse
from django_filters import rest_framework as filters
from rest_framework import viewsets, mixins
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError, PermissionDenied, NotFound
from rest_framework.response import Response
from reversion.models import Version

from api.v1.serializers.event_serializer import DataDumpRequestSerializer
from api.v1.serializers.form_serializers import ReportFormInstanceListSerializer
from api.v1.serializers.parameter_serializers import ParameterSerializer, ParameterVersionSerializer
from api.v1.serializers.target_serializers import (
    TargetSerializer,
    TargetTypeSerialzer,
    DataSourceSerializer,
    DataSourceGroupListSerializer,
    DataSourceGroupDetailSerializer,
    TargetMapSerializer,
)
from api.v1.serializers.camera_serializers import CameraSerializer, VideoFrameSerializer
from api.v1.views.template_views import TemplateView
from api.v1.views.timeseries_views import TimeseriesView
from base.filters import CharInFilter, FilterListBackend, SlugifiedFilter
from base.permissions import Authenticated
from base.permissions import StaffOnly
from base.serializers import unfreeze
from remotes.dispatch import send_simple_message
from remotes.models import DataDumpRequest
from targets.graphs import target_graph
from targets.mixins import NestedInTargetMixin
from targets.models import (
    Target,
    TargetType,
    DataSource,
    DataSourceGroup,
    Parameter,
    TargetMap
)


class TargetFilter(filters.FilterSet):
    name = SlugifiedFilter(field_name="canonical_name", lookup_expr="contains")
    zone = SlugifiedFilter(
        field_name="zone__natural_name",
        lookup_expr="contains",
        help_text="The name of the zone the target is in (commune, province, region)",
    )
    zone_nk = filters.CharFilter(
        field_name="zone__natural_name",
        help_text="Exact natural key of the zone the target is in"
    )
    type = SlugifiedFilter(field_name="type")
    state = SlugifiedFilter(field_name="state")
    with_remote = filters.BooleanFilter(
        method=lambda qs, _, value: qs.filter(remote__isnull=not value),
        help_text="Return targets with remotes linked (true) or without remotes linked (false)",
    )

    class Meta:
        model = Target
        fields = [
            "name",
            "zone",
            "type",
            "state",
        ]


class TargetView(viewsets.ReadOnlyModelViewSet):
    filterset_class = TargetFilter
    filter_backends = [FilterListBackend]
    lookup_field = 'canonical_name'
    lookup_value_regex = '[^/]+'
    permission_classes = (Authenticated,)
    serializer_class = TargetSerializer
    queryset = Target.objects.all() \
        .select_related('zone', 'remote', 'type', 'state') \
        .prefetch_related('work_sites__entity') \
        .cache()

    @action(methods=["get"], detail=True)
    def form_instance(self, request, canonical_name=None):
        target = self.get_object()
        if not request.user.has_perm(f'targets.reportforms.form.read', target):
            raise PermissionDenied()

        queryset = target.form_instances.all() \
            .prefetch_related('target__work_sites__entity', 'form_requests') \
            .select_related('version')
        return Response(ReportFormInstanceListSerializer(queryset, many=True).data)

    @action(methods=["get"], detail=True, permission_classes=(StaffOnly,))
    def graph(self, request, canonical_name=None):
        target = self.get_object()
        tmp = tempfile.TemporaryFile()
        target_graph(target, tmp)
        tmp.seek(0)
        return FileResponse(tmp, content_type="image/svg+xml")


class TargetTypeView(viewsets.ReadOnlyModelViewSet):
    queryset = TargetType.objects.all()
    serializer_class = TargetTypeSerialzer


class DumpRequestFilter(filters.FilterSet):
    profile = SlugifiedFilter(field_name="profile")

    class Meta:
        model = DataDumpRequest
        fields = [
            "profile",
        ]


class NestedDumpRequestView(mixins.ListModelMixin, mixins.CreateModelMixin, viewsets.GenericViewSet):
    filterset_class = DumpRequestFilter
    filter_backends = [FilterListBackend]
    permission_classes = (Authenticated,)
    serializer_class = DataDumpRequestSerializer

    def get_queryset(self):
        return DataDumpRequest.objects.filter(target__canonical_name=self.kwargs.get('target_canonical_name')) \
            .prefetch_related('created_by')

    def perform_create(self, request):
        target = Target.objects.filter(canonical_name=self.kwargs.get('target_canonical_name')).first()
        if target is None:
            raise ValidationError(detail="target doesn't exist")
        if target.remote is None:
            raise ValidationError(detail="target has no remote")

        serializer = self.get_serializer_class()(data=request.data)
        serializer.is_valid(raise_exception=True)
        dump_request = serializer.save(target=target, created_by=self.request.user)

        send_simple_message(**dump_request.get_message_args())
        return serializer.save(target=target, created_by=self.request.user)


class NestedTimeseriesView(TimeseriesView):
    def get_queryset(self):
        target_canonical_name = self.kwargs.get('target_canonical_name')
        return super().get_queryset().filter(target__canonical_name=target_canonical_name)


class DataSourceFilter(filters.FilterSet):
    type = filters.CharFilter(
        help_text='The type of the data source',
    )
    profiled_by = filters.CharFilter(
        help_text='A template prefix that selects data sources profiled by templates (e.g. "ef-mvp")',
        method='profiled_by_filter',
    )
    group = CharInFilter(
        help_text='A comma-separated list of group canonical names the source belongs to',
        field_name='groups',
        lookup_expr='canonical_name__in',
    )
    group_parent = CharInFilter(
        help_text='A comma-separated list of group canonical names whose children the source belongs to',
        field_name='groups',
        lookup_expr='parents__canonical_name__in',
    )

    class Meta:
        model = DataSource
        fields = [
            'type',
            'profiled_by',
            'group',
            'group_parent',
        ]

    def profiled_by_filter(self, queryset, name, value):
        return queryset.filter(pk__in=[
            ds.pk
            for ds in queryset.all()
            if ds.profiled(value)
        ])


class NestedDataSourceView(viewsets.ReadOnlyModelViewSet):
    filterset_class = DataSourceFilter
    filter_backends = [FilterListBackend]
    permission_classes = (Authenticated,)
    serializer_class = DataSourceSerializer

    def get_queryset(self):
        target_canonical_name = self.kwargs.get('target_canonical_name')
        return (
            DataSource.objects.filter(target__canonical_name=target_canonical_name).prefetch_related(
                'groups').prefetch_related('timeseries').distinct()
        )

    @action(methods=['get'], detail=True)
    def download_sheet(self, request, **kwargs):
        sheet = self.get_object().sheet
        return FileResponse(sheet.file, as_attachment=True, filename=sheet.name)


class DataSourceGroupFilter(filters.FilterSet):
    parent = CharInFilter(
        help_text='A comma-separated list of group canonical names which are parents of the selected groups',
        field_name='parents',
        lookup_expr='canonical_name__in',
    )

    class Meta:
        model = DataSourceGroup
        fields = [
            'parent'
        ]


class NestedDataSourceGroupView(viewsets.ReadOnlyModelViewSet):
    lookup_field = 'canonical_name'
    lookup_value_regex = '[^/]+'
    filterset_class = DataSourceGroupFilter
    filter_backends = [FilterListBackend]
    permission_classes = (Authenticated,)

    def get_queryset(self):
        target_canonical_name = self.kwargs.get('target_canonical_name')
        queryset = DataSourceGroup.objects.filter(target__canonical_name=target_canonical_name) \
            .prefetch_related('data_sources__groups').distinct()
        return queryset

    def get_serializer_class(self):
        if self.action == 'list':
            return DataSourceGroupListSerializer
        return DataSourceGroupDetailSerializer


class NestedTemplateView(TemplateView):

    def spread_sources(self, target, spec):
        groups = self.spread_groups(target, spec)
        return DataSource.objects.filter(
            target=target,
            groups__in=groups,
        )

    def spread_groups(self, target, spec):
        spec = unfreeze(spec)
        return (
            DataSourceGroup.objects.filter(
                **{**spec["query"], "target": target},
            )
            if "query" in spec
            else DataSourceGroup.objects.filter(
                target=target,
                **(
                    {"canonical_name__in": [item["canonical_name"] for item in spec["items"]]}
                    if "items" in spec else
                    {"parents__canonical_name__in": [item["canonical_name"] for item in spec["parents"]]}
                )
            )
        )

    @action(methods=["get"], detail=True, permission_classes=(Authenticated,))
    def scope(self, request, canonical_name=None, target_canonical_name=None):
        target = Target.objects.filter(canonical_name=target_canonical_name).first()
        if target is None:
            return Response(status=404, data={"detail": "Not found."})
        from targets.profiling import FOREST
        node = next(
            (
                n
                for n in FOREST.values()
                if n.value.canonical_name == canonical_name
            ),
            None,
        )
        if node is None:
            return Response(status=404, data={"detail": "Not found."})
        return Response(data={
            "scope": node.value.scope,
            "target": target.canonical_name,
            "sources": None
            if node.value.scope != "spread"
            else DataSourceSerializer(self.spread_sources(target, node.value.groups), many=True).data,
            "groups": None
            if node.value.scope != "group"
            else DataSourceGroupListSerializer(self.spread_groups(target, node.value.groups), many=True).data,
        })


class NestedParameterView(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet
):
    lookup_field = 'canonical_name'
    lookup_value_regex = '[^/]+'
    permission_classes = (Authenticated,)
    serializer_class = ParameterSerializer

    def get_queryset(self):
        target_canonical_name = self.kwargs.get('target_canonical_name')
        return Parameter.objects.filter(target__canonical_name=target_canonical_name)

    @action(methods=["get"], detail=True)
    def history(self, request, target_canonical_name=None, canonical_name=None):
        parameter = self.get_object()
        versions = Version.objects.get_for_object(parameter).prefetch_related(
            "revision",
            "revision__user",
            "revision__user__groups",
            "revision__user__profile",
            "revision__user__profile__targets",
        )
        return Response(data=ParameterVersionSerializer(versions, many=True).data)


class TargetMapView(viewsets.ReadOnlyModelViewSet):
    permission_classes = (Authenticated,)
    serializer_class = TargetMapSerializer

    def get_queryset(self):
        target_canonical_name = self.kwargs.get('target_canonical_name')
        target = Target.objects.filter(canonical_name=target_canonical_name).first()
        if target is None:
            raise NotFound(detail="Target not found.")
        return TargetMap.objects.filter(target=target)


class CameraView(NestedInTargetMixin, viewsets.ReadOnlyModelViewSet):
    serializer_class = CameraSerializer
    permission_classes = (Authenticated,)

    def get_queryset(self):
        return self.target.cameras.all()


class VideoFrameView(NestedInTargetMixin, viewsets.ReadOnlyModelViewSet):
    serializer_class = VideoFrameSerializer
    permission_classes = (Authenticated,)

    def get_queryset(self):
        camera_pk = self.kwargs.get('camera_pk')
        camera = self.target.cameras.filter(pk=camera_pk).first()
        if camera is None:
            raise NotFound(detail="Camera not found.")
        return camera.video_frames.all()

    @action(methods=['get'], detail=True)
    def download(self, request, **kwargs):
        video_frame = self.get_object()
        return FileResponse(video_frame.image, as_attachment=True)
