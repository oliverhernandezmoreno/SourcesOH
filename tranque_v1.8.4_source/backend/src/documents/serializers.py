from rest_framework import serializers

from documents.models import Document


class DocumentSerializer(serializers.ModelSerializer):
    uploaded_by = serializers.SlugRelatedField(read_only=True, slug_field='username')

    class Meta:
        model = Document
        fields = (
            'id',
            'name',
            'description',
            'created_at',
            'uploaded_by',
            'meta',
            'type'
        )
        read_only_fields = ('id', 'created_at', 'uploaded_by', 'name')


class DocumentMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = (
            'name',
            'description',
            'meta'
        )
