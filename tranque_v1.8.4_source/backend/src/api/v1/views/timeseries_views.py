import coreapi
import coreschema
from django.http import FileResponse
from django_filters import rest_framework as filters
from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import NotFound, ValidationError
from rest_framework.response import Response


import targets.exporters.excel
from api.v1.serializers.target_serializers import (
    TimeseriesListSerializer,
    TimeseriesSerializer
)
from base.filters import CharInFilter, FilterListBackend
from base.permissions import Authenticated
from documents.views import DocumentReadOnlyViewSet, DocumentUploadMixin, DocumentFilter
from targets.elastic.aggregations import AGGREGATION_TYPES
from targets.graphs import build_raw_graph
from targets.models import (
    Timeseries
)
from base import schemas


class TimeseriesFilter(filters.FilterSet):
    canonical_name = filters.CharFilter(
        lookup_expr='contains',
        help_text='Case-sensitive filter of timeseries whose canonical_name contains this value'
    )

    canonical_name__in = CharInFilter(
        field_name='canonical_name',
        lookup_expr='in',
        help_text='A comma-separated list of canonical_names to match',
    )

    template_name = filters.CharFilter(
        help_text='The name or list of names of the template that generated the time series',
        method='template_name_filter',
    )

    template_category = filters.CharFilter(
        help_text='The category of the template that generated the series collection',
        method='template_category_filter',
    )

    type = filters.CharFilter(
        help_text='The type of the time series',
    )

    data_source__in = CharInFilter(
        field_name='data_source',
        lookup_expr='canonical_name__in',
        help_text='The data source linked to the timeseries',
    )

    data_source_group = filters.CharFilter(
        lookup_expr='canonical_name__exact',
        help_text='The data source group linked to the timeseries',
    )

    class Meta:
        model = Timeseries
        fields = [
            'canonical_name',
            'template_name',
            'template_category',
            'data_source_group',
        ]

    def template_name_filter(self, queryset, name, value):
        """Filter by the template name (or template names, if a
        comma-separated list is given).

        """
        return queryset.filter(template_name__in=value.split(","))

    def template_category_filter(self, queryset, name, value):
        """Filter by the category assigned to the template that generated each
        timeseries.

        """
        from targets.profiling import FOREST
        templates = [
            t.value.canonical_name
            for t in FOREST.values()
            if (
                       isinstance(t.value.category, str) and
                       t.value.category == value
               ) or (
                       isinstance(t.value.category, (tuple, list)) and
                       value in t.value.category
               )
        ]
        return queryset.filter(template_name__in=templates)


class CustomTimeseriesViewSchema(schemas.CustomSchema):
    """
    Override manual fields in timeseries api schema
    """

    @schemas.parameters.get('/timeseries/')
    @schemas.parameters.get('/timeseries/{canonical_name}/')
    def max_events(self):
        return [
            coreapi.Field(
                name='max_events',
                required=False,
                location='query',
                schema=coreschema.Integer(
                    description='Number of events to retrieve when serializing the timeseries. Default=0'
                ),
            ),
        ]

    @schemas.parameters.get('/timeseries/export/')
    def canonical_name__in(self):
        return [
            coreapi.Field(
                name='canonical_name__in',
                required=True,
                location='query',
                schema=coreschema.String(
                    description='Comma-separated list of (full) canonical names to match'
                ),
            ),
        ]

    @schemas.parameters.get(lambda path: '/export' in path)
    def export_parameters(self):
        return [
            coreapi.Field(
                name='date_from',
                required=False,
                location='query',
                schema=coreschema.String(
                    description='A date to filter events with @timestamp equal or after this value'
                ),
            ),
            coreapi.Field(
                name='date_to',
                required=False,
                location='query',
                schema=coreschema.String(
                    description='A date to filter events with @timestamp before this value'
                ),
            ),
            coreapi.Field(
                name='head',
                required=False,
                location='query',
                schema=coreschema.String(
                    description='A field that, if present and not empty, indicates that the '
                    '"head" of the timeseries should be exported'
                ),
            ),
            coreapi.Field(
                name='filename',
                required=False,
                location='query',
                schema=coreschema.String(
                    description='File name used for the download'
                ),
            ),
        ]

    @schemas.parameters.get('/timeseries/{canonical_name}/aggregation/')
    def aggregation_parameters(self):
        return [
            coreapi.Field(
                name='aggregation_type',
                required=True,
                location='query',
                schema=coreschema.String(
                    description=f'The type of aggregation to use in response ({", ".join(AGGREGATION_TYPES)})'
                ),
            ),
            coreapi.Field(
                name='interval',
                required=False,
                location='query',
                schema=coreschema.String(
                    description='The time interval for the aggregation, '
                    'for info on valid values go to '
                    'https://www.elastic.co/guide/en/elasticsearch/reference/7.3/'
                    'search-aggregations-bucket-datehistogram-aggregation.html'
                    '#_calendar_and_fixed_intervals'
                ),
            ),
            coreapi.Field(
                name='intervals',
                required=False,
                location='query',
                schema=coreschema.Integer(
                    description='The expected amount of intervals used; only valid if the '
                    'interval parameter is not given'
                ),
            ),
            coreapi.Field(
                name='date_from',
                required=False,
                location='query',
                schema=coreschema.String(
                    description='A date to filter events with @timestamp equal or after this value'
                ),
            ),
            coreapi.Field(
                name='date_to',
                required=False,
                location='query',
                schema=coreschema.String(
                    description='A date to filter events with @timestamp before this value'
                ),
            ),
            coreapi.Field(
                name='timezone_offset',
                required=False,
                location='query',
                schema=coreschema.Integer(
                    description='A number of minutes representing the offset of the timezone '
                    '(use positive values for "negative" timezones)'
                ),
            ),
        ]

    @schemas.parameters.get('/timeseries/{canonical_name}/head/')
    def head_parameters(self):
        return [
            coreapi.Field(
                name='date_to',
                required=False,
                location='query',
                schema=coreschema.String(
                    description="A maximum date for the head query (events won't exceed this date)"
                ),
            ),
        ]


class TimeseriesView(viewsets.ReadOnlyModelViewSet):
    filterset_class = TimeseriesFilter
    filter_backends = [FilterListBackend]
    lookup_field = 'canonical_name'
    lookup_value_regex = '[^/]+'
    permission_classes = (Authenticated,)
    schema = CustomTimeseriesViewSchema.as_schema()

    def get_queryset(self):
        return TimeseriesSerializer.get_queryset()

    def get_serializer_class(self):
        if self.action == 'list':
            return TimeseriesListSerializer
        return TimeseriesSerializer

    def get_serializer_context(self):
        try:
            max_events = int(self.request.query_params.get('max_events', 0))
        except ValueError:
            raise ValidationError(detail='max_events param must be a valid number')
        return {
            **super().get_serializer_context(),
            'max_events': max_events,
        }

    @action(methods=["get"], detail=True)
    def aggregation(self, request, canonical_name=None, target_canonical_name=None):
        timeseries = self.get_object()
        aggregation_type = request.query_params.get('aggregation_type', None)
        if aggregation_type is None:
            raise ValidationError('aggregation_type param is required')
        date_from = request.query_params.get('date_from', None)
        date_to = request.query_params.get('date_to', None)
        interval = request.query_params.get('interval', None)
        try:
            intervals = request.query_params.get('intervals', None)
            intervals = None if not intervals else int(intervals)
        except ValueError:
            raise ValidationError('intervals param must be an integer, if given')
        try:
            timezone_offset = request.query_params.get('timezone_offset', None)
            timezone_offset = None if not timezone_offset else int(timezone_offset)
        except ValueError:
            raise ValidationError('timezone_offset param must be an integer, if given')
        return Response({
            'results': timeseries.get_events_aggregation(
                aggregation_type,
                interval=interval,
                intervals=intervals,
                date_from=date_from,
                date_to=date_to,
                timezone_offset=timezone_offset,
                raise_exception=True,
            )
        })
    aggregation.__doc__ = "\n".join([
        """The main endpoint for timeseries exploration, it returns aggregated
        values from within the specified interval (`date_from` and
        `date_to` parameters) and grouped according to the specified
        interval (`interval`). The `aggregation_type` parameter
        specifies the aggregation performed for each interval:\n""",
        *(f"- `{t}`: {f.__doc__ or ''}" for t, f in AGGREGATION_TYPES.items()),
        "\nEach event in a response contains the `@timestamp` and `value` properties only.",
    ])

    @action(methods=["get"], detail=True)
    def head(self, request, canonical_name=None, target_canonical_name=None):
        """Return a snapshot of the 'head' of the series: all events that
        match the latest timestamp found.

        """
        timeseries = self.get_object()
        date_to = request.query_params.get('date_to', None) or None
        return Response({
            'results': timeseries.get_head(date_to=date_to)
        })

    def export_queryset_response(self, request, qs):
        filename = request.query_params.get('filename', 'exported-timeseries.xlsx').strip()
        date_from = request.query_params.get('date_from') or None
        date_to = request.query_params.get('date_to') or None
        head = bool(request.query_params.get('head'))
        filename = filename or 'exported-timeseries.xlsx'
        if not filename.endswith('.xlsx'):
            filename = filename + '.xlsx'
        try:
            output = targets.exporters.excel.export_timeseries(
                qs,
                head=head,
                date_from=date_from,
                date_to=date_to
            )
        except ValueError as e:
            raise ValidationError(detail=' '.join(str(arg) for arg in e.args))
        return FileResponse(
            output,
            as_attachment=True,
            filename=filename,
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        )

    @action(methods=['get'], detail=False)
    def export(self, request, target_canonical_name=None):
        """Return an xlsx-formatted response with the data contained in the
        specified timeseries.

        """
        canonical_names = list(filter(bool, map(
            str.strip,
            request.query_params.get('canonical_name__in', '').split(','),
        )))
        qs = self.get_queryset().filter(canonical_name__in=canonical_names)
        return self.export_queryset_response(request, qs)

    @action(methods=['get'], detail=True, url_path='export')
    def export_single(self, request, *_, **__):
        """Exports the data for this time series in xlsx format.

        """
        timeseries = self.get_object()
        return self.export_queryset_response(
            request,
            self.get_queryset().filter(pk=timeseries.pk),
        )

    @action(methods=['get'], detail=True, url_path='export-inputs')
    def export_inputs(self, request, *_, **__):
        """Exports the selected time series and its inputs in xlsx format.

        """
        timeseries = self.get_object()
        collection, edges = build_raw_graph(timeseries, 'inputs')
        return self.export_queryset_response(
            request,
            self.get_queryset().filter(pk__in=list(collection)),
        )

    @action(methods=['get'], detail=True, url_path='export-derivations')
    def export_derivations(self, request, *_, **__):
        """Exports the selected time series and its derivations in xlsx
        format.

        """
        timeseries = self.get_object()
        collection, edges = build_raw_graph(timeseries, 'derivations')
        return self.export_queryset_response(
            request,
            self.get_queryset().filter(pk__in=list(collection)),
        )


class NestedTimeseriesDocumentView(DocumentReadOnlyViewSet, DocumentUploadMixin, mixins.DestroyModelMixin):

    filterset_class = DocumentFilter
    filter_backends = [FilterListBackend]

    def resolve_timeseries(self):
        try:
            return (
                Timeseries.objects
                .select_related('target')
                .get(canonical_name=self.kwargs.get('timeseries_canonical_name'))
            )
        except Timeseries.DoesNotExist:
            raise NotFound(detail="Timeseries not found.")

    def get_queryset(self):
        return self.resolve_timeseries().documents.all()

    def perform_document_create(self, file_obj, description, meta, request, type):
        ts = self.resolve_timeseries()
        doc = super().perform_document_create(file_obj, description, meta, request, type)
        ts.documents.add(doc)
        return doc

    @staticmethod
    def folder_for_timeseries(ts):
        return f'documents/timeseries/{ts.target.canonical_name}/{ts.canonical_name}'

    def get_folder(self):
        return self.folder_for_timeseries(self.resolve_timeseries())
