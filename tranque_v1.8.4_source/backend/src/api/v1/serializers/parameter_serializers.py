from rest_framework import serializers

from api.v1.serializers.user_serializers import UserSerializer
from targets.models import Parameter


class ParameterSerializer(serializers.ModelSerializer):

    name = serializers.CharField(read_only=True)
    canonical_name = serializers.CharField(read_only=True)
    schema = serializers.SerializerMethodField()

    class Meta:
        model = Parameter
        fields = ('name', 'canonical_name', 'schema', 'value')

    def get_schema(self, p):
        return p.get_schema()

    def validate_value(self, value):
        if self.instance is None:
            raise serializers.ValidationError("missing parameter instance when validating value")
        if value is None:
            return value
        self.instance.validate_value(value)
        return value


class ParameterVersionSerializer(serializers.Serializer):

    value = serializers.JSONField(source="field_dict.value")
    user = UserSerializer(source="revision.user")
    date_created = serializers.DateTimeField(source="revision.date_created")
