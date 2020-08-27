from rest_framework import serializers

from remotes.models import EventTraceRequest, DataDumpRequest


class EventTraceRequestSerializer(serializers.ModelSerializer):
    created_by = serializers.SlugRelatedField(read_only=True, slug_field='username')

    class Meta:
        model = EventTraceRequest
        fields = (
            'id',
            'event_id',
            'state',
            'created_at',
            'created_by',
            'received_at',
        )


class DataDumpRequestSerializer(serializers.ModelSerializer):
    created_by = serializers.SlugRelatedField(read_only=True, slug_field='username')

    class Meta:
        model = DataDumpRequest
        fields = (
            'id',
            'target',
            'profile',
            'date_from',
            'date_to',
            'state',
            'created_at',
            'created_by',
            'received_at',
        )
        read_only_fields = ('id', 'target', 'state', 'created_at', 'created_by', 'received_at')
