import tempfile

import coreapi
import coreschema
from django.http import FileResponse
from rest_framework import response, viewsets, serializers
from rest_framework.decorators import action
from rest_framework.utils.urls import replace_query_param

from base.pagination import PageNumberPagination
from base.permissions import StaffOnly
from base import schemas
from targets.graphs import template_graph
from targets.profiling.base import serialize_node


class CustomTemplateViewSchema(schemas.CustomSchema):

    @schemas.parameters.get('/template/')
    def default_list_filters(self):
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
            coreapi.Field(
                name='category',
                required=False,
                location='query',
                schema=coreschema.String(
                    description='The category to filter templates',
                ),
            ),
        ]

    @schemas.parameters.get('/graph/')
    def graph_parameters(self):
        return [
            coreapi.Field(
                name='direction',
                required=False,
                location='query',
                schema=coreschema.String(
                    description='The direction the graph should be traversed (up or down)',
                ),
            ),
        ]


def int_or_default(variant, default, minimum, maximum):
    if not variant:
        return default
    try:
        parsed = int(variant, 10)
        if parsed < minimum:
            return minimum
        if parsed > maximum:
            return maximum
        return parsed
    except ValueError:
        return default


class TemplateView(viewsets.GenericViewSet):
    lookup_value_regex = '[^/]+'
    lookup_field = 'canonical_name'
    pagination_class = None

    schema = CustomTemplateViewSchema.as_schema()
    serializer_class = serializers.Serializer

    def get_paginated_response(self, data):
        page_data = sorted(data, key=lambda n: n.value.canonical_name)
        page_size = int_or_default(
            self.request.query_params.get("page_size"),
            PageNumberPagination.page_size,
            1,
            PageNumberPagination.max_page_size,
        )
        max_page = len(page_data) // page_size + 1
        if len(page_data) == (max_page - 1) * page_size:
            max_page -= 1
        page = int_or_default(
            self.request.query_params.get("page"),
            1,
            1,
            len(page_data) // page_size + 1,
        )
        start = (page - 1) * page_size
        end = page * page_size
        return response.Response(data={
            "count": len(page_data),
            "next": (
                replace_query_param(
                    self.request.build_absolute_uri(),
                    "page",
                    page + 1,
                ) if page < max_page else None
            ),
            "previous": (
                replace_query_param(
                    self.request.build_absolute_uri(),
                    "page",
                    page - 1,
                ) if page > 1 else None
            ),
            "results": map(serialize_node, page_data[start:end]),
        })

    def list(self, request, **kwargs):
        from targets.profiling import FOREST
        category = self.request.query_params.get("category")
        return self.get_paginated_response(
            node
            for node in FOREST.values()
            if (category is not None and node.value.category == category)
            or category is None
        )

    def retrieve(self, request, canonical_name=None, **kwargs):
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
            return response.Response(status=404, data={"detail": "Not found."})
        return response.Response(data=serialize_node(node))

    @action(methods=["get"], detail=True, permission_classes=(StaffOnly,))
    def graph(self, request, canonical_name=None, **kwargs):
        direction = {"down": "inputs", "up": "derivations"}.get(
            request.query_params.get("direction", "down"),
            "inputs",
        )
        try:
            tmp = tempfile.TemporaryFile()
            template_graph(canonical_name, tmp, direction=direction)
            tmp.seek(0)
        except ValueError:
            return response.Response(status=404, data={"detail": "Not found."})
        return FileResponse(tmp, content_type="image/svg+xml")


class ManifestView(viewsets.GenericViewSet):
    lookup_value_regex = '[^/]+'
    lookup_field = 'name'
    pagination_class = None
    serializer_class = serializers.Serializer

    def list(self, request, **kwargs):
        from targets.profiling import MANIFESTS
        return response.Response(data={"results": list(MANIFESTS.values())})

    def retrieve(self, request, name=None, **kwargs):
        from targets.profiling import MANIFESTS
        manifest = MANIFESTS.get(name)
        if manifest is None:
            return response.Response(status=404, data={"detail": "Not found."})
        return response.Response(data=manifest)
