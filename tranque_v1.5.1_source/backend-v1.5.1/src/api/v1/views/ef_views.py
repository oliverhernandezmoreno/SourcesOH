import coreapi
import coreschema
from rest_framework import viewsets, mixins

from api.v1.serializers.ef_serializers import EFTopographyProfileSerializer
from base.permissions import Authenticated
from base import schemas
from targets.models import DataSource, DataSourceGroup


class TopographyProfileViewSchema(schemas.CustomSchema):

    @schemas.parameters.get()
    def date_to_parameter(self):
        return [
            coreapi.Field(
                name='date_to',
                required=False,
                location='query',
                schema=coreschema.String(
                    description="A maximum date for the head query (events won't exceed this date)"
                )
            )
        ]


class NestedEFTopographyProfileView(mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    """This endpoint returns a spanpshot of the spatial timeseries related
    to topography profiles of the dam, alongside a few projected
    snapshots of piezometer measurements.

    This endpoint **does not** list all possible topography
    profiles. To achieve that, you may use the [datasource
    list](/api/docs/v1/#target-datasource-list) endpoint with a proper
    `group` parameter. For example:

    ```http
    GET /api/docs/v1/target/some-random-target/datasource/?group=perfil-transversal HTTP/1.1
    ```

    The entities returned by _that_ endpoint may be used (their ID) to
    find a specific topography profile for _this_ endpoint.

    Given a response object `response` from this endpoint, an example
    of obtaining the topography spatial series as vectors of [x, y]
    pairs is:

    ```javascript
    response.timeseries.map((t) => ({
      name: t.canonical_name,
      data: t.events.map((e) => [e.coords.x, e.value]) // expect many pairs here
    }))
    ```

    _Then_, given the same response object `response`, an example of
    obtaining the projected piezometer measurements is:

    ```javascript
    response.projected_sources
      .map((piezometer) => piezometer.timeseries.map((t) => ({
        source: piezometer,
        name: t.canonical_name,
        data: t.events
          .filter((e) => typeof e.coords.x !== "undefined")
          .map((e) => [e.coords.x, e.value]) // expect zero or one pairs here
      })))
      .reduce((flat, nested) => [...flat, ...nested], []); // flatten since it's doubly nested
    ```

    This endpoint achieves a projection on the `x` coordinate over
    events in `projected_sources`. If the projection fails (for
    example because of missing or invalid piezometer coordinates, or
    missing or invalid profile coordinates), the `x` coordinate of
    each piezometer will be missing.

    """

    permission_classes = (Authenticated,)
    queryset = DataSource.objects.prefetch_related("groups").all()
    serializer_class = EFTopographyProfileSerializer
    schema = TopographyProfileViewSchema.as_schema()

    def get_queryset(self):
        return self.queryset.filter(
            target__canonical_name=self.kwargs.get('target_canonical_name'),
            groups__in=DataSourceGroup.objects.filter(
                target__canonical_name=self.kwargs.get('target_canonical_name'),
                canonical_name=self.serializer_class.GROUP_CANONICAL_NAME
            )
        )

    def get_serializer_context(self):
        context = super().get_serializer_context()
        return {
            **context,
            "kwargs": self.kwargs,
        }
