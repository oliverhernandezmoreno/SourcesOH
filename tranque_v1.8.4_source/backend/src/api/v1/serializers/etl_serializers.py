from django.conf import settings
from django.db.models.query import EmptyQuerySet
from rest_framework import serializers

from etl.models import (
    import_executor,
    DataFile,
    ETLOperation,
    ETLExtractedValue,
    ETLConformedValue,
)
from etl.exceptions import ETLError
from targets.models import Timeseries, DataSource


class DataFileSerializer(serializers.ModelSerializer):

    uploaded_by = serializers.SlugRelatedField(read_only=True, slug_field='username')
    downloadable = serializers.SerializerMethodField()

    def get_downloadable(self, instance):
        return (
            'request' in self.context and (
                instance.uploaded_by is None or
                self.context['request'].user.id == instance.uploaded_by.id
            )
        )

    class Meta:
        model = DataFile
        fields = (
            'id',
            'filename',
            'uploaded_by',
            'downloadable',
            'created_at',
        )


class ETLOperationSerializer(serializers.ModelSerializer):

    user = serializers.SerializerMethodField()
    target = serializers.SlugRelatedField(read_only=True, slug_field='canonical_name')
    deliverable = serializers.BooleanField()
    data_file = serializers.SerializerMethodField()
    data_count = serializers.SerializerMethodField()

    def get_user(self, instance):
        if instance.user is None:
            return None
        return {
            'username': instance.user.username,
            'first_name': instance.user.first_name,
            'last_name': instance.user.last_name,
        }

    def get_data_file(self, instance):
        if instance.data_file is None:
            return None
        return DataFileSerializer(instance.data_file, context=self.context).data

    def get_data_count(self, instance):
        return instance.conformed_values.count()

    class Meta:
        model = ETLOperation
        fields = '__all__'


class ETLOperationStartSerializer(serializers.Serializer):

    executor = serializers.CharField()
    data_file_id = serializers.CharField(required=False, allow_null=True)
    context = serializers.DictField()

    def validate_executor(self, value):
        try:
            import_executor(value)
            return value
        except ETLError:
            raise serializers.ValidationError(f"executor '{value}' doesn't exist")

    def validate_data_file_id(self, value):
        if value is not None and not DataFile.objects.filter(pk=value).exists():
            raise serializers.ValidationError(f"data_file_id '{value}' is not a proper data file id")
        return value


class ETLExtractedDataSerializer(serializers.ModelSerializer):

    class Meta:
        model = ETLExtractedValue
        fields = '__all__'


class DataSourceSerializer(serializers.ModelSerializer):

    class Meta:
        model = DataSource
        fields = (
            'hardware_id',
            'canonical_name',
            'name',
        )


class TimeseriesSerializer(serializers.ModelSerializer):

    data_source = DataSourceSerializer(read_only=True)

    class Meta:
        model = Timeseries
        fields = (
            'canonical_name',
            'name',
            'description',
            'data_source',
        )


class TimeseriesExplainSerializer(serializers.ModelSerializer):

    class Meta:
        model = Timeseries
        fields = (
            'canonical_name',
            'name',
            'choices',
        )


class ETLDataSerializer(serializers.ModelSerializer):

    series = TimeseriesSerializer(read_only=True)

    class Meta:
        model = ETLConformedValue
        fields = '__all__'


class ExecutorSerializer(serializers.Serializer):

    name = serializers.CharField(source="executor")
    flavour = serializers.CharField(allow_null=True)
    default_context = serializers.JSONField()
    error_codes = serializers.ListField(child=serializers.CharField())
    flavours = serializers.ListField(child=serializers.CharField())
    required_datasets = serializers.SerializerMethodField()
    sample_files = serializers.SerializerMethodField()

    def get_required_datasets(self, executor):
        target = self.context.get("target")
        if target is None:
            return {"executable": False, "counts": {}}
        group = executor.conform_group_queryset(executor.default_context, target)
        source = executor.conform_source_queryset(executor.default_context, target, groups=group)
        series = executor.conform_series_queryset(executor.default_context, target, sources=source, groups=group)
        parameter = executor.conform_parameter_queryset(executor.default_context, target)
        counts = dict(filter(bool, (
            ("group", group.count()) if not isinstance(group, EmptyQuerySet) else None,
            ("source", source.count()) if not isinstance(source, EmptyQuerySet) else None,
            ("series", series.count()) if not isinstance(series, EmptyQuerySet) else None,
            ("parameter", parameter.count()) if not isinstance(parameter, EmptyQuerySet) else None,
        )))
        return {
            "executable": all(c > 0 for c in counts.values()),
            "counts": counts
        }

    def get_sample_files(self, executor):
        return [
            f"{settings.STATIC_URL}{f}"
            for f in getattr(executor, "sample_files", ())
        ]
