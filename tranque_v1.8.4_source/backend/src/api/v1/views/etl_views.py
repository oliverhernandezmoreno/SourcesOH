import coreapi
import coreschema
from django.db.models import Q
from django.http import FileResponse
from django_filters import rest_framework as filters
from rest_framework import parsers, serializers, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError, NotFound
from rest_framework.response import Response

from api.v1.serializers.etl_serializers import (
    DataFileSerializer,
    ETLOperationSerializer,
    ETLOperationStartSerializer,
    ETLExtractedDataSerializer,
    ETLDataSerializer,
    TimeseriesExplainSerializer,
    ExecutorSerializer,
)
from base import schemas
from base.filters import CharInFilter, FilterListBackend
from base.pagination import PageNumberPagination
from base.permissions import Authenticated
from base.serializers import default_serializer, empty_serializer
from etl.exceptions import ETLError
from etl.models import import_executor, get_executors, DataFile, ETLOperation
from targets.models import Target, DataSourceGroup, DataSource, Timeseries, Parameter


class DataFileRawUploadView(viewsets.GenericViewSet):
    """This endpoint expects a RAW body with the contents of the file
    being uploaded. It can't be interacted with through the docs GUI.

    """

    lookup_field = 'filename'
    parser_classes = (parsers.FileUploadParser,)
    permission_classes = (Authenticated,)
    serializer_class = empty_serializer(DataFile)

    def update(self, request, filename, format=None):
        file_obj = request.data['file']
        data_file = DataFile(
            file=file_obj,
            filename=filename,
            uploaded_by=request.user,
        )
        data_file.save()
        serializer = DataFileSerializer(data_file, context=self.get_serializer_context())
        return Response(data=serializer.data, status=201)


class DataFileView(viewsets.ReadOnlyModelViewSet):

    permission_classes = (Authenticated,)
    queryset = DataFile.objects.all().prefetch_related('uploaded_by')
    serializer_class = DataFileSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        return qs.filter(Q(uploaded_by=self.request.user) | Q(uploaded_by__isnull=True))

    @action(methods=["get"], detail=True)
    def download(self, request, pk=None):
        data_file = self.get_object()
        return FileResponse(data_file.file, as_attachment=True, filename=data_file.filename)

    @action(
        methods=["post"],
        detail=False,
        url_path="upload-multipart",
        parser_classes=(parsers.FormParser, parsers.MultiPartParser,),
        serializer_class=empty_serializer(DataFile),
    )
    def upload_multipart(self, request):
        """This endpoint expects a multipart body with a 'file' parameter and
        an optional 'filename' parameter. It can't be interacted with
        through the docs GUI.

        """
        try:
            file_obj = request.data['file']
        except KeyError:
            raise ValidationError(detail='file parameter is required')
        filename = request.data.get('filename', 'unspecified')
        data_file = DataFile(
            file=file_obj,
            filename=filename,
            uploaded_by=request.user,
        )
        data_file.save()
        serializer = DataFileSerializer(data_file, context=self.get_serializer_context())
        return Response(data=serializer.data, status=201)


class OperationFilter(filters.FilterSet):

    executor = CharInFilter(
        field_name='executor',
        lookup_expr='in',
        help_text='The executor or executors that performed the operation',
    )
    user = filters.CharFilter(
        field_name='user',
        lookup_expr='username__exact',
        help_text='The user (username) that started the operation',
    )

    class Meta:
        model = ETLOperation
        fields = [
            'executor',
            'user',
        ]


class OperationView(viewsets.ReadOnlyModelViewSet):

    permission_classes = (Authenticated,)
    filterset_class = OperationFilter
    filter_backends = [FilterListBackend]
    queryset = ETLOperation.objects.all()
    serializer_class = ETLOperationSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        return (
            qs
            .filter(target__canonical_name=self.kwargs.get('target_canonical_name'))
            .select_related('user', 'data_file', 'data_file__uploaded_by')
            .prefetch_related('conformed_values', 'target')
        )

    def get_serializer_class(self):
        if self.action == "create":
            return ETLOperationStartSerializer
        return super().get_serializer_class()

    def perform_create(self, request, target_canonical_name=None):
        serializer = self.get_serializer_class()(data=request.data)
        serializer.is_valid(raise_exception=True)
        target = Target.objects.filter(canonical_name=target_canonical_name).first()
        if target is None:
            raise ValidationError(detail="target doesn't exist")
        try:
            operation = ETLOperation.start(
                serializer.validated_data["executor"],
                request.user,
                target,
                DataFile.objects.filter(pk=serializer.validated_data["data_file_id"]).first()
                if serializer.validated_data.get("data_file_id") else
                None,
                serializer.validated_data["context"],
            )
        except ETLError as e:
            raise ValidationError(detail=e.detail)
        return operation

    def create(self, request, target_canonical_name=None):
        operation = self.perform_create(request, target_canonical_name=target_canonical_name)
        output_serializer = ETLOperationSerializer(operation, context=self.get_serializer_context())
        return Response(data=output_serializer.data, status=201)

    @action(methods=["get"], detail=True, url_path="extracted-data")
    def extracted_data(self, request, target_canonical_name=None, pk=None):
        operation = self.get_object()
        serializer = ETLExtractedDataSerializer(operation.extracted_values.all(), many=True)
        return Response(data=serializer.data)

    @action(methods=["get"], detail=True)
    def data(self, request, target_canonical_name=None, pk=None):
        operation = self.get_object()
        serializer = ETLDataSerializer(
            operation.conformed_values
            .select_related('series', 'series__data_source')
            .all(),
            many=True,
        )
        return Response(data=serializer.data)

    @action(methods=["post"], detail=True, serializer_class=empty_serializer(ETLOperation))
    def deliver(self, request, target_canonical_name=None, pk=None):
        operation = self.get_object()
        try:
            operation.deliver()
        except ETLError as e:
            raise ValidationError(detail=e.detail)
        serializer = ETLOperationSerializer(operation, context=self.get_serializer_context())
        return Response(data=serializer.data)

    @action(
        methods=["post"],
        detail=False,
        url_path="deliver",
        serializer_class=ETLOperationStartSerializer,
    )
    def deliver_immediately(self, request, target_canonical_name=None):
        operation = self.perform_create(request, target_canonical_name=target_canonical_name)
        status = 201
        if not operation.deliverable:
            status = 400
        else:
            operation.deliver()
        serializer = ETLOperationSerializer(operation, context=self.get_serializer_context())
        return Response(data=serializer.data, status=status)

    @action(methods=["post"], detail=True, serializer_class=empty_serializer(ETLOperation))
    def cancel(self, request, target_canonical_name=None, pk=None):
        operation = self.get_object()
        operation.finished = True
        operation.save()
        serializer = ETLOperationSerializer(operation, context=self.get_serializer_context())
        return Response(data=serializer.data)

    @action(methods=["get"], detail=True)
    def explain(self, request, target_canonical_name=None, pk=None):
        operation = self.get_object()
        plan = operation.execution_plan()
        facts = operation.execution_facts()
        return Response(data={
            "plan": [
                TimeseriesExplainSerializer(ts, many=True).data
                for ts in plan
            ],
            "facts": facts,
        })


class ExecutorSchema(schemas.CustomSchema):

    @schemas.parameters.get("etl-executor/")
    @schemas.parameters.get("etl-executor/{executor}/")
    def no_parameters(self):
        return []

    @schemas.parameters.get("etl-executor/{executor}/group/")
    @schemas.parameters.get("etl-executor/{executor}/source/")
    @schemas.parameters.get("etl-executor/{executor}/series/")
    @schemas.parameters.get("etl-executor/{executor}/parameter/")
    def queryset_pagination_parameters(self):
        return [
            coreapi.Field(
                name='page',
                required=False,
                location='query',
                schema=coreschema.Integer(
                    description='A page number within the pageinated result set.'
                ),
            ),
            coreapi.Field(
                name='page_size',
                required=False,
                location='query',
                schema=coreschema.Integer(
                    description='Number of results to return per page.'
                ),
            ),
        ]

    @schemas.serializers.get()
    def no_fields(self):
        return []


class ExecutorView(viewsets.GenericViewSet):

    permission_classes = (Authenticated,)
    lookup_value_regex = '[^/]+'
    lookup_field = 'name'
    pagination_class = None

    schema = ExecutorSchema.as_schema()
    serializer_class = serializers.Serializer

    def get_target(self):
        try:
            return Target.objects.get(canonical_name=self.kwargs.get("target_canonical_name"))
        except Target.DoesNotExist:
            raise NotFound(detail="Target not found.")

    def get_object(self):
        executor = self.kwargs.get("name")
        try:
            return import_executor(executor)
        except ETLError:
            raise NotFound(detail="Executor not found.")

    def list(self, request, **kwargs):
        """Shows all executors available for ETL operations. The standard
        flavours are listed as well.

        """
        target = self.get_target()
        executors = list(get_executors())
        serializer = ExecutorSerializer(executors, many=True, context={"target": target})
        return Response(data={
            "count": len(executors),
            "next": None,
            "previous": None,
            "results": serializer.data
        })

    def retrieve(self, request, **kwargs):
        """Retrieve a single executor spec for ETL operations.

        """
        target = self.get_target()
        executor = self.get_object()
        serializer = ExecutorSerializer(executor, context={"target": target})
        return Response(data=serializer.data)

    @action(methods=["get"], detail=True)
    def group(self, request, **kwargs):
        """List the groups linked to the executor.

        """
        target = self.get_target()
        executor = self.get_object()
        paginator = PageNumberPagination()
        serializer = default_serializer(DataSourceGroup)(
            paginator.paginate_queryset(
                executor.conform_group_queryset(executor.default_context, target),
                request,
            ),
            many=True
        )
        return paginator.get_paginated_response(serializer.data)

    @action(methods=["get"], detail=True)
    def source(self, request, **kwargs):
        """List the sources linked to the executor.

        """
        target = self.get_target()
        executor = self.get_object()
        groups = executor.conform_group_queryset(executor.default_context, target)
        paginator = PageNumberPagination()
        serializer = default_serializer(DataSource)(
            paginator.paginate_queryset(
                executor.conform_source_queryset(executor.default_context, target, groups=groups),
                request,
            ),
            many=True
        )
        return paginator.get_paginated_response(serializer.data)

    @action(methods=["get"], detail=True)
    def series(self, request, **kwargs):
        """List the series linked to the executor.

        """
        target = self.get_target()
        executor = self.get_object()
        groups = executor.conform_group_queryset(executor.default_context, target)
        sources = executor.conform_source_queryset(executor.default_context, target, groups=groups)
        paginator = PageNumberPagination()
        serializer = default_serializer(Timeseries)(
            paginator.paginate_queryset(
                executor.conform_series_queryset(executor.default_context, target, groups=groups, sources=sources),
                request,
            ),
            many=True
        )
        return paginator.get_paginated_response(serializer.data)

    @action(methods=["get"], detail=True)
    def parameter(self, request, **kwargs):
        """List the parameters linked to the executor.

        """
        target = self.get_target()
        executor = self.get_object()
        paginator = PageNumberPagination()
        serializer = default_serializer(Parameter)(
            paginator.paginate_queryset(
                executor.conform_parameter_queryset(executor.default_context, target),
                request,
            ),
            many=True
        )
        return paginator.get_paginated_response(serializer.data)
