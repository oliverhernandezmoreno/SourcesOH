from django_filters import rest_framework as filters
from rest_framework.viewsets import GenericViewSet

from base.filters import SlugifiedFilter
from base.mixins import ListCountMixin
from base.serializers import default_serializer
from targets.models import Zone


class ZoneFilter(filters.FilterSet):

    parent = SlugifiedFilter(field_name="parent__canonical_name", help_text="The parent zone")
    type = SlugifiedFilter(field_name="type", help_text="The zone type")

    class Meta:
        model = Zone
        fields = [
            "parent",
            "type",
        ]


class ZoneListView(ListCountMixin, GenericViewSet):
    """
    list:
    Returns a paginated list of zones.

    count:
    Returns the total count of zones.
    """

    queryset = Zone.objects.all().order_by("-coords__y").cache()
    serializer_class = default_serializer(Zone)
    filter_class = ZoneFilter
