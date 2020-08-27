from django.utils.text import slugify
from django_filters import rest_framework as filters


class SlugifiedFilter(filters.CharFilter):
    """Parses a string and slugifies it before filtering.

    """

    def filter(self, qs, value):
        return super().filter(qs, slugify(value))


class CharInFilter(filters.BaseInFilter, filters.CharFilter):
    """Parses a comma-separated list of strings (which don't have commas).

    """
    pass


class FilterListBackend(filters.DjangoFilterBackend):
    """Applies the filter backend to the non-detail actions only.

    """

    def get_filterset_class(self, view, queryset=None):
        if not view.detail:
            return super().get_filterset_class(view, queryset)
        return None
