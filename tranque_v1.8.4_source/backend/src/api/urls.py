from itertools import groupby
from pathlib import Path

from django.conf import settings
from django.urls import include, path
from django.views.generic.base import RedirectView
from rest_framework.authtoken import views
from rest_framework.documentation import get_docs_view, get_schemajs_view
from rest_framework.response import Response
from rest_framework.schemas import get_schema_view, SchemaGenerator
from rest_framework.schemas.generators import EndpointEnumerator
from rest_framework.views import APIView


def version_components(v):
    omit = "."
    return tuple(
        (part if not isnumber else int(part))
        for isnumber, part in (
            (k, "".join(g))
            for k, g in groupby(v, lambda c: c.isdigit())
        )
        if part != omit
    )


versions = sorted([
    nested.name
    for nested in Path(__file__).parent.iterdir()
    if nested.is_dir()
    if (nested / "urls.py").exists()
], key=version_components)

urlpatterns = [
    *[
        path(f"{version}/", include(f"api.{version}.urls", namespace=version))
        for version in versions
    ],
]

schema_view = get_schema_view(title="Backend API")


class CommitView(APIView):
    def get(self, request):
        "Returns the current git commit's sha1"
        return Response({"sha1": settings.COMMIT})


def make_docs_view(version, namespace, prefix, module, public=True):
    title = f"{prefix}Backend API \u2014 {version}"

    class DocsEndpointEnumerator(EndpointEnumerator):
        def should_include_endpoint(self, path, callback):
            if not super().should_include_endpoint(path, callback):
                return False
            return path.startswith(f"/api/{version}/") and \
                callback.cls.__module__.startswith(f"api.{version}.{module}.")

    class DocsSchemaGenerator(SchemaGenerator):
        endpoint_inspector_cls = DocsEndpointEnumerator

    docs_view = get_docs_view(
        title=title,
        public=public,
        generator_class=DocsSchemaGenerator,
    )
    schema_js_view = get_schemajs_view(
        title=title,
        public=public,
        generator_class=DocsSchemaGenerator,
    )
    urls = [
        path("", docs_view, name="docs-index"),
        path("schema.js", schema_js_view, name="schema-js")
    ]
    return include((urls, "api-docs"), namespace=namespace)


urlpatterns += [
    path("", RedirectView.as_view(url=f"/api/{versions[-1]}/")),
    path("docs/", RedirectView.as_view(url=f"/api/docs/{versions[-1]}/")),
    path("docs/public/", make_docs_view("public", "api-docs-public", prefix="Public ", module="views")),
    path("docs/v1/", make_docs_view("v1", "api-docs-v1", prefix="Internal ", module="views")),
    path("schema", schema_view),
    path("token-auth", views.obtain_auth_token),
    path("commit", CommitView.as_view()),
]
