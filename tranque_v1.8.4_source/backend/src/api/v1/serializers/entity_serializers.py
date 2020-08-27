from rest_framework import serializers

from entities.models import WorkSite, Entity


class EntitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Entity
        fields = ('id', 'name', 'meta')


class WorkSiteSerializer(serializers.ModelSerializer):
    entity = EntitySerializer()

    class Meta:
        model = WorkSite
        fields = ('id', 'name', 'entity')


class WorkSiteSmallSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkSite
        fields = ('id', 'name')
