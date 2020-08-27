from django.utils.functional import cached_property
from rest_framework import serializers

from base.serializers import CoordsSerializerMixin
from targets.models import Zone


class InnerZoneSerializer(CoordsSerializerMixin, serializers.ModelSerializer):
    natural_key = serializers.SerializerMethodField()

    class Meta:
        model = Zone
        exclude = ("geometry",)

    def get_natural_key(self, instance):
        # A retro-compatible alias
        return instance.natural_name


class ZoneSerializer(InnerZoneSerializer):
    zone_hierarchy = serializers.SerializerMethodField()

    def get_zone_hierarchy(self, obj):
        hierarchy = [x for x in self.hierarchy_zones if obj.natural_name.startswith(f'{x.natural_name}.')]
        return InnerZoneSerializer(hierarchy, many=True).data

    @cached_property
    def hierarchy_zones(self):
        return list(Zone.objects.exclude(type='comuna').cache())
