from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from api.v1.serializers.entity_serializers import WorkSiteSerializer
from api.v1.serializers.zone_serializers import ZoneSerializer
from documents.serializers import DocumentSerializer, DocumentMessageSerializer
from reportforms.models import (
    ReportForm,
    ReportFormComment,
    ReportFormVersion,
    ReportFormInstance,
    FormInstanceRequest,
    FormCaseComment,
    FormCase,
)
from targets.models import Target


class ReportFormSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReportForm
        fields = '__all__'


class ReportFormVersionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReportFormVersion
        fields = '__all__'


class ReportFormVersionListSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReportFormVersion
        fields = ('id', 'code', 'title', 'form')


class ReportFormRequestSerializer(serializers.ModelSerializer):
    created_by = serializers.SlugRelatedField(read_only=True, slug_field='username')

    class Meta:
        model = FormInstanceRequest
        fields = (
            'id',
            'new_instance',
            'old_instance',
            'state',
            'created_at',
            'created_by',
            'received_at',
            'comment'
        )


class ReportFormInstanceCommentSerializer(serializers.ModelSerializer):
    created_by = serializers.SlugRelatedField(read_only=True, slug_field='username')

    class Meta:
        model = ReportFormComment
        fields = ('id', 'content', 'created_by', 'created_at')


class ReportFormInstanceListSerializer(serializers.ModelSerializer):
    version_code = serializers.SlugRelatedField(read_only=True, slug_field='code', source='version')
    target_name = serializers.SlugRelatedField(read_only=True, slug_field='name', source='target')
    form_field_count = serializers.SlugRelatedField(read_only=True, slug_field='field_count', source='version')
    target_canonical_name = serializers.SlugRelatedField(read_only=True, slug_field='canonical_name', source='target')
    work_sites = WorkSiteSerializer(read_only=True, many=True, source='target.work_sites')
    zone = ZoneSerializer(read_only=True, source='target.zone')
    target_meta = serializers.SlugRelatedField(read_only=True, slug_field='meta', source='target')
    form_requests = ReportFormRequestSerializer(read_only=True, many=True)
    comments = ReportFormInstanceCommentSerializer(read_only=True, many=True)

    def validate_answer(self, answer):
        if self.instance and self.instance.validate_answer(answer):
            return answer
        raise serializers.ValidationError('Invalid answer')

    class Meta:
        model = ReportFormInstance
        fields = (
            'id', 'version', 'version_code', 'trimester', 'year', 'answer_started', 'created_at',
            'updated_at', 'state', 'reason', 'target_name', 'target_canonical_name', 'comments', 'work_sites',
            'form_field_count', 'answer_count', 'zone', 'received_at', 'sent_at', 'target_meta', 'form_requests'
        )
        read_only_fields = ('received_at',)


class ReportFormInstanceCreateSerializer(ReportFormInstanceListSerializer):
    target_canonical_name = serializers.SlugRelatedField(
        slug_field='canonical_name',
        queryset=Target.objects.all(),
        source='target',
    )

    class Meta:
        model = ReportFormInstance
        fields = (
            'trimester', 'year', 'version', 'target_canonical_name',
            'id', 'version_code', 'answer_started', 'created_at',
            'updated_at', 'state', 'target_name', 'work_sites', 'form_field_count',
            'answer_count', 'zone', 'received_at', 'sent_at'
        )
        read_only_fields = (
            'id', 'version_code', 'answer_started', 'created_at',
            'updated_at', 'state', 'target_name', 'work_sites', 'form_field_count',
            'answer_count', 'zone', 'received_at', 'sent_at'
        )


class ReportFormInstanceSerializer(serializers.ModelSerializer):
    version_schema = serializers.SlugRelatedField(read_only=True, slug_field='form_schema', source='version')
    target_name = serializers.SlugRelatedField(read_only=True, slug_field='name', source='target')
    target_canonical_name = serializers.SlugRelatedField(read_only=True, slug_field='canonical_name', source='target')
    documents = DocumentSerializer(read_only=True, many=True)
    work_sites = WorkSiteSerializer(read_only=True, many=True, source='target.work_sites')
    zone = ZoneSerializer(read_only=True, source='target.zone')
    comments = ReportFormInstanceCommentSerializer(read_only=True, many=True)

    def validate_answer(self, answer):
        if self.instance and self.instance.validate_answer(answer):
            return answer
        raise serializers.ValidationError('Invalid answer')

    class Meta:
        model = ReportFormInstance
        # TODO replace __all__ with list of required fields only
        fields = '__all__'


class FormCaseCommentSerializer(serializers.ModelSerializer):
    created_by = serializers.SlugRelatedField(read_only=True, slug_field='username')

    class Meta:
        model = FormCaseComment
        fields = ('id', 'content', 'created_by', 'created_at', 'updated_at')


class FormCaseListSerializer(serializers.ModelSerializer):
    target_name = serializers.SlugRelatedField(read_only=True, source='form_instance.target', slug_field='name')
    work_sites = WorkSiteSerializer(read_only=True, many=True, source='form_instance.target.work_sites')
    zone = serializers.SlugRelatedField(read_only=True, source='form_instance.target.zone', slug_field='natural_name')
    target_meta = serializers.SlugRelatedField(read_only=True, slug_field='meta', source='form_instance.target')
    trimester = serializers.SlugRelatedField(read_only=True, source='form_instance', slug_field='trimester')
    year = serializers.SlugRelatedField(read_only=True, source='form_instance', slug_field='year')

    class Meta:
        model = FormCase
        fields = (
            'id', 'form_instance', 'year', 'trimester', 'title', 'description', 'state', 'created_by', 'created_at',
            'updated_at', 'closed_at', 'target_name', 'work_sites', 'zone', 'target_meta'
        )


class FormCaseSerializer(FormCaseListSerializer):
    documents = DocumentSerializer(read_only=True, many=True)
    comments = FormCaseCommentSerializer(read_only=True, many=True)
    reassign_reason = serializers.SlugRelatedField(read_only=True, source='reassign_to', slug_field='reason')

    def create(self, validated_data):
        try:
            form_instance = ReportFormInstance.objects.get(pk=self.initial_data['form_instance'])
        except ReportFormInstance.DoesNotExist:
            raise ValidationError(detail="ReportFormInstance not found.")
        return FormCase.objects.create(**validated_data, form_instance=form_instance)

    class Meta:
        model = FormCase
        fields = (
            'id', 'form_instance', 'year', 'trimester', 'title', 'description', 'state', 'reassign_reason',
            'created_by', 'created_at', 'updated_at', 'closed_at', 'documents', 'comments', 'target_name',
            'work_sites', 'zone'
        )


# Handler serializers
class ReportFormVersionHandlerSerializer(serializers.ModelSerializer):
    form = ReportFormSerializer(read_only=True)

    class Meta:
        model = ReportFormVersion
        fields = '__all__'


class ReportFormInstanceHandlerSerializer(serializers.ModelSerializer):
    version = ReportFormVersionHandlerSerializer(read_only=True)
    target = serializers.SlugRelatedField(slug_field='canonical_name', queryset=Target.objects.all())
    documents = DocumentMessageSerializer(read_only=True)

    class Meta:
        model = ReportFormInstance
        fields = ('id', 'version', 'trimester', 'year', 'created_at', 'answer', 'sent_at', 'state',
                  'target', 'documents')
