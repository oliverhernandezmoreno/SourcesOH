from rest_framework import serializers

from base.serializers import CoordsSerializerMixin
from targets.models import Target
from targets.models import Zone
from targets.models import DataSource


class ZoneSerializer(CoordsSerializerMixin, serializers.ModelSerializer):

    natural_key = serializers.SerializerMethodField()

    class Meta:
        model = Zone
        fields = "__all__"

    def get_natural_key(self, instance):
        # A retro-compatible alias
        return instance.natural_name


class DataSourceSerializer(CoordsSerializerMixin, serializers.ModelSerializer):

    groups = serializers.SlugRelatedField(many=True, read_only=True, slug_field="canonical_name")
    deg_coords = serializers.SerializerMethodField()

    class Meta:
        model = DataSource
        fields = (
            "hardware_id",
            "name",
            "coords",
            "groups",
            "deg_coords",
        )


class TargetSerializer(CoordsSerializerMixin, serializers.ModelSerializer):

    company = serializers.SerializerMethodField()
    target_name = serializers.SerializerMethodField()
    data_sources = DataSourceSerializer(many=True)

    class Meta:
        model = Target
        fields = (
            "id",
            "name",
            "canonical_name",
            "state",
            "company",
            "target_name",
            "data_sources",
            "zone",
            "coords",
            "deg_coords",
        )

    def get_company(self, target):
        return target.meta["entity"]["value"]

    def get_target_name(self, target):
        return target.meta["work"]["value"]


class TargetDetailSerializer(CoordsSerializerMixin, serializers.ModelSerializer):

    data_sources = DataSourceSerializer(many=True)
    zone = ZoneSerializer(read_only=True)

    class Meta:
        model = Target
        fields = "__all__"
