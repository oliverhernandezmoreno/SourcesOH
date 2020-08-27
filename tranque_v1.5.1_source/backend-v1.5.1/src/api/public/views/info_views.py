from rest_framework.response import Response
from rest_framework.viewsets import GenericViewSet

from base.mixins import ListCountMixin
from base.serializers import default_serializer
from infos.models import Info, SiteParameter


class InfoListView(ListCountMixin, GenericViewSet):
    queryset = Info.objects.all()
    serializer_class = default_serializer(Info)


class SiteParameterView(GenericViewSet):
    def list(self, request, *args, **kwargs):
        return Response({x.name: x.value for x in SiteParameter.objects.all()})
