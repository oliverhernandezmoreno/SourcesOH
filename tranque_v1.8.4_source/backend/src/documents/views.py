import json
from json import JSONDecodeError

from django.core.files.storage import default_storage
from django.http import FileResponse
from django_filters import rest_framework as filters
from rest_framework import viewsets, parsers
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response


from base.serializers import empty_serializer
from documents.models import Document, build_document_path, DocumentType
from documents.serializers import DocumentSerializer


class DocumentUploadMixin(object):
    def get_folder(self):
        raise NotImplementedError()

    def validate_file(self, file_obj):
        path = build_document_path(self.get_folder(), str(file_obj))
        if default_storage.exists(path):
            raise ValidationError(detail='File already exists')

    def perform_document_create(self, file_obj, description, meta, request, type):
        # TODO when something fails during document creation, the file
        # may still be uploaded to storage
        doc = Document(
            folder=self.get_folder(),
            file=file_obj,
            description=description,
            meta=meta,
            name=str(file_obj),
            uploaded_by=request.user,
            type=type,
        )
        doc.save()
        return doc

    @action(
        methods=['post'],
        detail=False,
        parser_classes=(parsers.FormParser, parsers.MultiPartParser,),
        serializer_class=empty_serializer(Document),
    )
    def upload(self, request, **kwargs):
        """
        This action expects a multipart body with a 'file' parameter and
        an optional 'filename' parameter. It can't be interacted with
        through the docs GUI.

        """
        try:
            file_obj = request.data['file']
        except KeyError:
            raise ValidationError(detail='file parameter is required')
        description = request.data.get('description', None)
        type = request.data.get('type', None)
        if type is not None:
            if not DocumentType.objects.filter(id=type).exists():
                return Response(data="Wrong document type.", status=400)
            type = DocumentType(id=type)

        meta = request.data.get('meta', None)
        parsed_meta = None
        if meta is not None:
            try:
                parsed_meta = json.loads(meta)
            except JSONDecodeError:
                raise ValidationError(detail='meta must be a valid json')
        self.validate_file(file_obj)
        doc = self.perform_document_create(file_obj, description, parsed_meta, request, type)
        serializer = DocumentSerializer(doc)
        return Response(data=serializer.data, status=201)


class DocumentFilter(filters.FilterSet):
    created_at_from = filters.DateFilter(
        field_name="created_at",
        lookup_expr='gte',
        help_text="A date to filter documents with created_at equal or after this value (yyyy-mm-dd)",
    )
    created_at_to = filters.DateFilter(
        field_name="created_at",
        lookup_expr='lte',
        help_text="A date to filter documents with created_at before or at this value (yyyy-mm-dd)",
    )

    type = filters.CharFilter(
        help_text="Exact id (e.g., ficha, medicion) that this timeseries' documents must match",
    )

    class Meta:
        model = Document
        fields = []


class DocumentReadOnlyViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer

    @action(methods=['get'], detail=True)
    def download(self, request, **kwargs):
        doc = self.get_object()
        return FileResponse(doc.file, as_attachment=True, filename=doc.name)
