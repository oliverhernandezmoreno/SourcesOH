import coreapi
import coreschema
from django.http import FileResponse
from django.utils import timezone
from django_filters import rest_framework as filters
from guardian.shortcuts import get_objects_for_user
from rest_framework import viewsets, mixins, serializers, status
from rest_framework.decorators import action
from rest_framework.exceptions import NotFound, ValidationError, PermissionDenied
from rest_framework.response import Response

from api.v1.serializers.form_serializers import (
    ReportFormSerializer,
    ReportFormVersionListSerializer, ReportFormVersionSerializer,
    ReportFormInstanceListSerializer, ReportFormInstanceSerializer,
    ReportFormInstanceCreateSerializer, ReportFormInstanceCommentSerializer,
    FormCaseListSerializer, FormCaseSerializer, FormCaseCommentSerializer,
    ReportFormRequestSerializer,
)
from base.filters import FilterListBackend
from base.permissions import UserPermissionChecker
from base import schemas
from documents.views import DocumentReadOnlyViewSet, DocumentUploadMixin
from reportforms.exporters.excel import export_form
from reportforms.models import ReportForm, ReportFormInstance, ReportFormVersion, FormCase, FormInstanceRequest
from targets.models import Target


class CustomFormViewSchema(schemas.CustomSchema):
    """
    Override manual fields in form api schema
    """

    @schemas.parameters.get('/{codename}/export/')
    def export_parameters(self):
        return [
            coreapi.Field(
                name='instance_id__in',
                required=False,
                location='query',
                schema=coreschema.String(
                    description='Comma-separated list of instance ids to export'
                ),
            ),
            coreapi.Field(
                name='filename',
                required=False,
                location='query',
                schema=coreschema.String(
                    description='filename for the exported file'
                ),
            ),
        ]


class FormPermissionMixin:
    def get_targets(self, perms=('targets.reportforms.form.read',)):
        queryset = get_objects_for_user(self.request.user, perms, klass=Target)
        if queryset.exists():
            return queryset
        else:
            raise PermissionDenied()

    def has_target_perm(self, target, codename):
        checker = getattr(self, '_checker', None)
        if checker is None:
            checker = UserPermissionChecker(self.request.user)
            checker.prefetch_perms(Target.objects.all())
            setattr(self, '_checker', checker)
        return checker.has_perm(f'targets.{codename}', target)


class ReportFormView(FormPermissionMixin, viewsets.ReadOnlyModelViewSet):
    lookup_field = 'codename'
    queryset = ReportForm.objects.all()
    serializer_class = ReportFormSerializer
    schema = CustomFormViewSchema.as_schema()

    @action(methods=["get"], detail=True)
    def export(self, request, codename=None):
        filename = request.query_params.get('filename', f'exported-form-{codename}.xlsx').strip()
        filename = filename or f'exported-form-{codename}.xlsx'
        if not filename.endswith('.xlsx'):
            filename = filename + '.xlsx'
        instance_ids = request.query_params.get('instance_id__in', '').split(',')
        form = self.get_object()
        versions = form.versions.all()
        targets = self.get_targets()
        instances = ReportFormInstance.objects.filter(version__in=versions, target__in=targets)
        if len(instance_ids) > 0:
            instances = instances.filter(id__in=instance_ids)
        try:
            output = export_form(versions, instances)
        except ValueError as e:
            raise ValidationError(detail=' '.join(str(arg) for arg in e.args))
        return FileResponse(
            output,
            as_attachment=True,
            filename=filename,
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        )


class CustomInstanceViewSchema(schemas.CustomSchema):
    """
    Override serializer fields in form instance api schema
    """

    @schemas.serializers.post('/instance/{id}/send/')
    def no_send_fields(self):
        return []


class InstanceFilter(filters.FilterSet):
    zone = filters.CharFilter(
        lookup_expr='startswith',
        help_text='The canonical name of the zone the associated target belongs to',
        field_name='target__zone__natural_name',
    )


class NestedReportFormInstanceView(FormPermissionMixin, viewsets.ModelViewSet):
    schema = CustomInstanceViewSchema.as_schema()
    filterset_class = InstanceFilter
    filter_backends = [FilterListBackend]

    def get_queryset(self):
        form_codename = self.kwargs.get('form_codename')
        targets = self.get_targets()
        queryset = ReportFormInstance.objects.filter(version__form__codename=form_codename, target__in=targets)
        queryset = queryset.select_related('target__zone', 'version')
        queryset = queryset.prefetch_related('target__work_sites__entity', 'form_requests', 'comments')
        return queryset

    def get_serializer_class(self):
        if self.action == 'list':
            return ReportFormInstanceListSerializer
        if self.action == 'create':
            return ReportFormInstanceCreateSerializer
        return ReportFormInstanceSerializer

    @action(methods=["post"], detail=True)
    def send(self, request, form_codename=None, pk=None):
        instance = self.get_object()
        if not self.has_target_perm(instance.target, 'reportforms.form.send'):
            raise PermissionDenied()
        instance.send_by = request.user
        instance.sent_at = timezone.now()
        instance.state = ReportFormInstance.State.ANSWER_RECEIVED
        instance.received_at = timezone.now()
        instance.save()

        return Response(ReportFormInstanceSerializer(instance).data)

    def _create_form_instance(self, data, raise_exception):
        target = Target.objects.filter(canonical_name=data.get('target_canonical_name', None)).first()
        if target is None or not self.has_target_perm(target, 'reportforms.form.create'):
            if raise_exception:
                raise PermissionDenied()
            else:
                return {"error": "permission required"}
        serializer = ReportFormInstanceCreateSerializer(data=data)
        if serializer.is_valid(raise_exception=raise_exception):
            try:
                self.perform_create(serializer)
            except ValidationError as e:
                if raise_exception:
                    raise
                else:
                    return e.detail
            return serializer.data
        else:
            return serializer.errors

    def create(self, request, *args, **kwargs):
        if isinstance(request.data, (tuple, list)):
            ret = [
                self._create_form_instance(instance_data, False)
                for instance_data in request.data
            ]
            return Response(ret, status=status.HTTP_201_CREATED)
        else:
            ret = self._create_form_instance(request.data, True)
            return Response(ret, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        state = request.data.get('state', None)
        answer = request.data.get('answer', None)
        if answer is not None and not self.has_target_perm(instance.target, 'reportforms.form.edit'):
            raise PermissionDenied()
        if (state == ReportFormInstance.State.ANSWER_VALIDATED
                and not self.has_target_perm(instance.target, 'reportforms.form.validate')):
            raise PermissionDenied()
        if (state == ReportFormInstance.State.ANSWER_TO_VALIDATE
                and not self.has_target_perm(instance.target, 'reportforms.form.edit')):
            raise PermissionDenied()
        if (state == ReportFormInstance.State.ANSWER_REVIEWED
                and not self.has_target_perm(instance.target, 'reportforms.form.review')):
            raise PermissionDenied()
        return super().update(request, *args, **kwargs)

    def perform_create(self, serializer):
        filter_options = {
            'trimester': serializer.validated_data['trimester'],
            'year': serializer.validated_data['year'],
            'version': serializer.validated_data['version'],
            'target': serializer.validated_data['target']
        }
        if ReportFormInstance.objects.filter(**filter_options).exclude(
                state__in=ReportFormInstance.CLOSED_STATES).count() > 0:
            raise serializers.ValidationError('An open instance already exists')
        instance = serializer.save()
        instance.state = ReportFormInstance.State.OPEN
        instance.save()


class ReportFormInstanceCommentView(FormPermissionMixin, mixins.CreateModelMixin, viewsets.ReadOnlyModelViewSet):
    serializer_class = ReportFormInstanceCommentSerializer

    def resolve_instance(self):
        form_codename = self.kwargs.get('form_codename')
        instance_pk = self.kwargs.get('form_instance_pk')
        instance = ReportFormInstance.objects.filter(version__form__codename=form_codename, pk=instance_pk).first()
        if instance is None:
            raise NotFound(detail="ReportFormInstance not found.")
        if not self.has_target_perm(instance.target, 'reportforms.form.review'):
            raise PermissionDenied()
        return instance

    def get_queryset(self):
        return self.resolve_instance().comments.all()

    def perform_create(self, serializer):
        instance = self.resolve_instance()
        serializer.save(form_instance=instance, created_by=self.request.user)


def invalid_create_state(state):
    return not (
            state == ReportFormInstance.State.ANSWER_RECEIVED
            or state == ReportFormInstance.State.ANSWER_SENT
            or state == ReportFormInstance.State.ANSWER_REVIEWED
    )


class NestedReportFormInstanceRequestView(
    FormPermissionMixin, mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet
):
    serializer_class = ReportFormRequestSerializer

    def _resolve(self):
        form_codename = self.kwargs.get('form_codename')
        instance_pk = self.kwargs.get('form_instance_pk')
        instance = ReportFormInstance.objects.filter(version__form__codename=form_codename, pk=instance_pk).first()
        if instance is None:
            raise ValidationError(detail="ReportFormInstance not found.")
        if not self.has_target_perm(instance.target, 'reportforms.form.read'):
            raise PermissionDenied()
        return instance

    def get_queryset(self):
        instance = self._resolve()
        if not self.has_target_perm(instance.target, 'reportforms.form.reassign.request') and not self.has_target_perm(
                instance.target, 'reportforms.form.reassign.resolve'):
            raise PermissionDenied()
        return instance.form_requests.all()

    def create(self, request, *args, **kwargs):
        instance = self._resolve()
        if not self.has_target_perm(instance.target, 'reportforms.form.reassign.request'):
            raise PermissionDenied()
        if invalid_create_state(instance.state):
            raise ValidationError("Can't request reassignment if answers have not been sent")
        if instance.form_requests.filter(state=FormInstanceRequest.State.CREATED).exists():
            raise ValidationError("Can't request reassignment if there is a request pending")
        form_request = FormInstanceRequest.objects.create(
            old_instance=instance,
            created_by=request.user,
            comment=request.data.get('comment', None)
        )
        serializer_data = ReportFormRequestSerializer(form_request).data
        return Response(serializer_data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        old_instance = self._resolve()
        if not self.has_target_perm(old_instance.target, 'reportforms.form.reassign.resolve'):
            raise PermissionDenied()
        request_instance = self.get_object()
        # only possible change is an update to state (to accept or decline requests)
        if request_instance.state != FormInstanceRequest.State.CREATED:
            raise ValidationError("Only requests not accepted/declined can be updated")
        # all other values will be ignored when updating
        new_state = request.data.get('state', None)
        serializer = ReportFormRequestSerializer(request_instance, data={'state': new_state}, partial=True)
        serializer.is_valid(raise_exception=True)
        request_instance = serializer.save()
        if request_instance.state == FormInstanceRequest.State.ACCEPTED:
            # create new form_instance from old instance
            new_instance = ReportFormInstance.objects.create(
                version=old_instance.version,
                trimester=old_instance.trimester,
                year=old_instance.year,
                state=ReportFormInstance.State.OPEN,
                target=old_instance.target
            )
            request_instance.new_instance = new_instance
            request_instance.save()
        return Response(ReportFormRequestSerializer(request_instance).data, status=status.HTTP_200_OK)


class FormInstanceDocumentView(
    FormPermissionMixin, DocumentReadOnlyViewSet, DocumentUploadMixin, mixins.DestroyModelMixin
):
    def get_queryset(self):
        instance = ReportFormInstance.objects.filter(pk=self.kwargs.get('form_instance_pk')).first()
        if instance is None:
            raise NotFound(detail="FormInstance not found.")
        if not self.has_target_perm(instance.target, 'reportforms.form.read'):
            raise PermissionDenied()
        queryset = instance.documents.all()
        return queryset

    def perform_document_create(self, file_obj, description, meta, request, type):
        # Override perform_document_create to add document to instance after creation
        doc = super().perform_document_create(file_obj, description, meta, request, type)
        instance = ReportFormInstance.objects.filter(pk=self.kwargs.get('form_instance_pk')).first()
        if instance is None:
            raise NotFound(detail="FormInstance not found.")
        if not self.has_target_perm(instance.target, 'reportforms.form.edit'):
            raise PermissionDenied()
        instance.documents.add(doc)
        return doc

    def get_folder(self):
        instance_pk = self.kwargs.get('form_instance_pk')
        return f'documents/form_instance/{instance_pk}'


class NestedReportFormVersionView(viewsets.ModelViewSet):
    lookup_field = 'code'

    def get_queryset(self):
        form_codename = self.kwargs.get('form_codename')
        queryset = ReportFormVersion.objects.filter(form__codename=form_codename)
        return queryset

    def get_serializer_class(self):
        if self.action == 'list':
            return ReportFormVersionListSerializer
        return ReportFormVersionSerializer


class FormCaseView(FormPermissionMixin, viewsets.ModelViewSet):
    def get_queryset(self):
        targets = self.get_targets(['targets.reportforms.form.case.read'])
        queryset = FormCase.objects.filter(form_instance__target__in=targets).prefetch_related(
            'form_instance__target__work_sites__entity',
            'form_instance__target__zone')
        return queryset

    def get_serializer_class(self):
        if self.action == 'list':
            return FormCaseListSerializer
        return FormCaseSerializer

    def create(self, request, *args, **kwargs):
        instance = ReportFormInstance.objects.filter(pk=request.data['form_instance']).first()
        if not self.has_target_perm(instance.target, 'reportforms.form.case.create'):
            raise PermissionDenied()
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        case = self.get_object()
        if not self.has_target_perm(case.form_instance.target, 'reportforms.form.case.update'):
            raise PermissionDenied()
        return super().update(request, *args, **kwargs)

    @action(methods=["post"], detail=True)
    def reassign(self, request, *arg, **kwargs):
        form_case = self.get_object()
        old_instance = form_case.form_instance
        if not self.has_target_perm(old_instance.target, 'reportforms.form.case.reassign'):
            raise PermissionDenied()
        reason = request.data.get('reason', None)
        if not reason:
            raise ValidationError(detail={"reason": "required"})
        if old_instance.state not in ReportFormInstance.SENT_STATES:
            raise ValidationError(detail={"state": "Only sent instances may be reassigned"})
        if ReportFormInstance.objects.filter(
                trimester=old_instance.trimester, year=old_instance.year
        ).exclude(
            state__in=[*ReportFormInstance.SENT_STATES, *ReportFormInstance.CLOSED_STATES]
        ).exists():
            raise ValidationError(detail=['there is an instance already open for this trimester'])
        new_instance = ReportFormInstance.objects.create(
            version=old_instance.version,
            trimester=old_instance.trimester,
            year=old_instance.year,
            state=ReportFormInstance.State.OPEN,
            target=old_instance.target,
            answer=old_instance.answer,
            reason=reason
        )
        form_case.reassign_to = new_instance
        form_case.save()
        serializer = FormCaseSerializer(form_case)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class FormCaseCommentView(FormPermissionMixin, mixins.CreateModelMixin, viewsets.ReadOnlyModelViewSet):
    serializer_class = FormCaseCommentSerializer

    def resolve_case(self):
        case_pk = self.kwargs.get('form_case_pk')
        try:
            case = FormCase.objects.get(pk=case_pk)
        except FormCase.DoesNotExist:
            raise NotFound(detail="FormCase not found.")
        if not self.has_target_perm(case.form_instance.target, 'reportforms.form.case.read'):
            raise PermissionDenied()
        return case

    def get_queryset(self):
        return self.resolve_case().comments.all()

    def perform_create(self, serializer):
        case = self.resolve_case()
        if not self.has_target_perm(case.form_instance.target, 'reportforms.form.case.comment'):
            raise PermissionDenied()
        serializer.save(case=case, created_by=self.request.user)


class FormCaseDocumentView(
    FormPermissionMixin, DocumentReadOnlyViewSet, DocumentUploadMixin, mixins.DestroyModelMixin
):
    def resolve_case(self):
        case_pk = self.kwargs.get('form_case_pk')
        try:
            case = FormCase.objects.get(pk=case_pk)
        except FormCase.DoesNotExist:
            raise NotFound(detail="FormCase not found.")
        if not self.has_target_perm(case.form_instance.target, 'reportforms.form.case.read'):
            raise PermissionDenied()
        return case

    def get_queryset(self):
        return self.resolve_case().documents.all()

    def perform_document_create(self, file_obj, description, meta, request, type):
        case = self.resolve_case()
        if not self.has_target_perm(case.form_instance.target, 'reportforms.form.case.update'):
            raise PermissionDenied()
        doc = super().perform_document_create(file_obj, description, meta, request, type)
        case.documents.add(doc)
        return doc

    def get_folder(self):
        case_pk = self.kwargs.get('form_case_pk')
        return f'documents/form_case/{case_pk}'
