from django.urls import path
from rest_framework.routers import DefaultRouter
from rest_framework_nested.routers import NestedDefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from api.v1.views.auth_views import CustomTokenObtainPairView
from api.v1.views.cron_views import CronView
from api.v1.views.info_views import SiteParameterView
from api.v1.views.ef_views import (
    NestedEFTopographyProfileView,
    NestedEFDepthDeformationView
)
from api.v1.views.entity_views import UserView
from api.v1.views.etl_views import (
    DataFileRawUploadView,
    DataFileView,
    OperationView,
    ExecutorView,
)
from api.v1.views.event_views import NestedEventView
from api.v1.views.form_views import (
    ReportFormView,
    ReportFormInstanceCommentView,
    NestedReportFormInstanceView,
    NestedReportFormVersionView,
    FormInstanceDocumentView,
    FormCaseDocumentView,
    FormCaseCommentView,
    NestedReportFormInstanceRequestView,
    FormCaseView,
)
from api.v1.views.status_views import StatusView, ContributingDocumentView
from api.v1.views.target_views import (
    TargetView,
    TargetTypeView,
    NestedTimeseriesView,
    NestedDataSourceView,
    NestedDataSourceGroupView,
    NestedTemplateView,
    NestedDumpRequestView,
    NestedParameterView,
    TargetMapView,
    CameraView,
    VideoFrameView,
)
from api.v1.views.template_views import ManifestView, TemplateView
from api.v1.views.ticket_views import (
    TicketsView,
    TicketView,
    TicketLogView,
    BroadcastView,
    TicketCommentView,
    TicketCommentDocumentView,
    TicketAuthorizationRequestView,
    PublicAlertMessageView,
    AuthorizationRequestDocumentView,
    AuthorizationRequestView,
    AlertDisconnectionsView,
    TargetAlertDisconnectionsView,
    AlertDisconnectionDocumentView,
    TargetManualAlertLogsView,
    ManualAlertLogDocumentView,
)
from api.v1.views.timeseries_views import TimeseriesView, NestedTimeseriesDocumentView
from api.v1.views.zone_views import ZoneListView

root_router = DefaultRouter()

# /cron/daily
root_router.register(r'cron', CronView, 'cron')

# /site-parameter/
root_router.register(r"site-parameter", SiteParameterView, "site-parameter")

# /tickets/
# /tickets/<id>
root_router.register(r'tickets', TicketsView, 'tickets')

# /disconnections/
# /disconnections/<id>
root_router.register(r'disconnections', AlertDisconnectionsView, 'disconnections')

# /ticket-requests/
# /ticket-requests/<id>
root_router.register(r'ticket-requests', AuthorizationRequestView, 'ticket-requests')

# /target/
# /target_type/<target_id>/
root_router.register(r'target-type', TargetTypeView, 'target-type')

# /target/
# /target/<target_canonical_name>/
root_router.register(r'target', TargetView, 'target')

# router nested in /target/<target_canonical_name>/
nested_target_router = NestedDefaultRouter(root_router, r'target', lookup='target')

# /target/<target_canonical_name>/dump-request/
nested_target_router.register(r'dump-request', NestedDumpRequestView, 'target-dump-request')

# /target/<target_canonical_name>/maps/
nested_target_router.register(r'maps', TargetMapView, 'target-maps')

# /target/<target_canonical_name>/datasource/
# /target/<target_canonical_name>/datasource/<datasource_pk>/
nested_target_router.register('datasource', NestedDataSourceView, 'target-datasource')

# /target/<target_canonical_name>/datasourcegroup/
# /target/<target_canonical_name>/datasourcegroup/<datasourcegroup_canonical_name>/
nested_target_router.register(r'datasourcegroup', NestedDataSourceGroupView, 'target-datasourcegroup')

# /target/<target_canonical_name>/camera/
# /target/<target_canonical_name>/camera/<camera_pk>/
nested_target_router.register(r'camera', CameraView, 'target-camera')

nested_camera_router = NestedDefaultRouter(nested_target_router, r'camera', lookup='camera')
nested_camera_router.register(r'frame', VideoFrameView, 'camera-fame')

# /target/<target_canonical_name>/parameter/
# /target/<target_canonical_name>/parameter/<canonical_name>/
# /target/<target_canonical_name>/parameter/<canonical_name>/history/
nested_target_router.register(r'parameter', NestedParameterView, 'target-parameter')

# /target/<target_canonical_name>/publicmessage/
# /target/<target_canonical_name>/publicmessage/<publicmessage_pk>/
nested_target_router.register(r'publicmessage', PublicAlertMessageView, 'target-publicmessages')

# /target/<target_canonical_name>/disconnection/
# /target/<target_canonical_name>/disconnection/<disconnection_pk>/
nested_target_router.register(r'disconnection', TargetAlertDisconnectionsView, 'target-disconnections')

nested_disconnection_router = NestedDefaultRouter(nested_target_router, r'disconnection', lookup='disconnection')

# /target/<target_canonical_name>/disconnection/<disconnection_pk>/document/
# /target/<target_canonical_name>/disconnection/<disconnection_pk>/document/<document_pk>/
nested_disconnection_router.register(r'document', AlertDisconnectionDocumentView, 'disconnection-document')

# /target/<target_canonical_name>/ticket/
# /target/<target_canonical_name>/ticket/<id>/
nested_target_router.register(r'ticket', TicketView, 'target-ticket')

nested_ticket_router = NestedDefaultRouter(nested_target_router, r'ticket', lookup='ticket')

# /target/<target_canonical_name>/ticket/<id>/manual/
# /target/<target_canonical_name>/ticket/<id>/manual/<manual_pk>/
nested_ticket_router.register(r'manual', TargetManualAlertLogsView, 'target-ticket-manual-alert-logs')

nested_manual_alert_router = NestedDefaultRouter(nested_ticket_router, r'manual', lookup='manual')

# /target/<target_canonical_name>/ticket/<id>/manual/<manual_pk>/document/
# /target/<target_canonical_name>/ticket/<id>/manual/<manual_pk>/document/<document_pk>/
nested_manual_alert_router.register(r'document', ManualAlertLogDocumentView, 'manual-alert-document')

# /target/<target_canonical_name>/ticket/<id>/log/
nested_ticket_router.register(r'log', TicketLogView, 'target-ticket-log')

# /target/<target_canonical_name>/ticket/<id>/broadcast/
nested_ticket_router.register(r'broadcast', BroadcastView, 'target-ticket-broadcast')

# /target/<target_canonical_name>/ticket/<id>/authorization/
nested_ticket_router.register(r'authorization', TicketAuthorizationRequestView, 'target-ticket-authorization')

nested_authorization_request_router = NestedDefaultRouter(
    nested_ticket_router, r'authorization', lookup='authorization'
)

# /target/<target_canonical_name>/ticket/<id>/authorization/<authorization_pk>/document/
# /target/<target_canonical_name>/ticket/<id>/authorization/<authorization_pk>/document/<document_pk>/
nested_authorization_request_router.register(
    r'document', AuthorizationRequestDocumentView, 'ticket-authorization-document'
)

# /target/<target_canonical_name>/ticket/<id>/comment/
# /target/<target_canonical_name>/ticket/<id>/comment/<comment_pk>/
nested_ticket_router.register(r'comment', TicketCommentView, 'target-ticket-comment')

nested_ticket_comment_router = NestedDefaultRouter(nested_ticket_router, r'comment', lookup='comment')

# /target/<target_canonical_name>/ticket/<id>/comment/<comment_pk>/document/
# /target/<target_canonical_name>/ticket/<id>/comment/<comment_pk>/document/<document_pk>/
nested_ticket_comment_router.register(r'document', TicketCommentDocumentView, 'comment-document')

# /target/<target_canonical_name>/status/
# /target/<target_canonical_name>/status/<module>/
# /target/<target_canonical_name>/status/<module>/intent/
nested_target_router.register(r'status', StatusView, 'target-status')

# router nested in /target/<target_canonical_name>/status/<status_module>/
nested_status_router = NestedDefaultRouter(nested_target_router, r'status', lookup='status')

# /target/<target_canonical_name>/status/<status_module>/document/
# /target/<target_canonical_name>/status/<status_module>/document/<document_pk>/
nested_status_router.register(r'document', ContributingDocumentView, 'status-document')

# /target/<target_canonical_name>/timeseries/
# /target/<target_canonical_name>/timeseries/<timeseries_canonical_name>/
nested_target_router.register(r'timeseries', NestedTimeseriesView, 'target-timeseries')

# router nested in /target/<target_canonical_name>/timeseries/<timeseries_canonical_name>/
nested_timeseries_router = NestedDefaultRouter(nested_target_router, r'timeseries', lookup='timeseries')

# /target/<target_canonical_name>/timeseries/<timeseries_canonical_name>/document/
# /target/<target_canonical_name>/timeseries/<timeseries_canonical_name>/document/<pk>/
nested_timeseries_router.register(r'document', NestedTimeseriesDocumentView, 'target-timeseries-document')

# /target/<target_canonical_name>/timeseries/<timeseries_canonical_name>/events/<id>/
# /target/<target_canonical_name>/timeseries/<timeseries_canonical_name>/events/<id>/trace-graph/
# /target/<target_canonical_name>/timeseries/<timeseries_canonical_name>/events/<id>/message-graph/
# /target/<target_canonical_name>/timeseries/<timeseries_canonical_name>/events/<id>/coverage-graph/
nested_timeseries_router.register(r'events', NestedEventView, 'target-timeseries-event')

# /target/<target_canonical_name>/ef/topography-profile/
# /target/<target_canonical_name>/ef/topography-profile/<hardware_id>/
nested_target_router.register(r'ef/topography-profile', NestedEFTopographyProfileView, 'ef-topography-profile')

# /target/<target_canonical_name>/ef/deformation-profile/
nested_target_router.register(r'ef/deformation-profile', NestedEFDepthDeformationView, 'ef-deformation-profile')

# /timeseries/
# /timeseries/<timeseries_canonical_name>/
root_router.register(r'timeseries', TimeseriesView, 'timeseries')

# /form/
# /form/<form_codename>/
# /form/<form_codename>/export/
root_router.register(r'form', ReportFormView, 'form')

# router nested in /form/<form_codename>/
nested_form_router = NestedDefaultRouter(root_router, r'form', lookup='form')

# /form/<form_codename>/v/
# /form/<form_codename>/v/<v_code>/
nested_form_router.register(r'v', NestedReportFormVersionView, 'form-version')

# /form/<form_codename>/instance/
# /form/<form_codename>/instance/<instance_pk>/
nested_form_router.register(r'instance', NestedReportFormInstanceView, 'form-instance')

# router nested in /form/<form_codename>/instance/<instance_pk>/
nested_form_instance_router = NestedDefaultRouter(nested_form_router, r'instance', lookup='form_instance')

# /form/<form_codename>/instance/<instance_pk>/document/
# /form/<form_codename>/instance/<instance_pk>/document/<document_pk>/
nested_form_instance_router.register(r'document', FormInstanceDocumentView, 'form-instance-document')

# /form/<form_codename>/instance/<instance_pk>/request/
# /form/<form_codename>/instance/<instance_pk>/request/<request_pk>/
nested_form_instance_router.register(r'request', NestedReportFormInstanceRequestView, 'form-instance-request')

# /form/<form_codename>/instance/<instance_pk>/comment/
# /form/<form_codename>/instance/<instance_pk>/comment/<comment_pk>/
nested_form_instance_router.register(r'comment', ReportFormInstanceCommentView, 'form-instance-comment')

# /data-file/
# /data-file/upload-multipart/
# /data-file/<data_file_pk>/
# /data-file/<data_file_pk>/download/
root_router.register(r'data-file', DataFileView, 'data-file')

# /data-file/upload-raw/<filename>/
root_router.register(r'data-file/upload-raw', DataFileRawUploadView, 'data-file-raw-upload')

# /target/<target_canonical_name>/etl-operation/
# /target/<target_canonical_name>/etl-operation/<operation_pk>/
# /target/<target_canonical_name>/etl-operation/<operation_pk>/data/
# /target/<target_canonical_name>/etl-operation/<operation_pk>/deliver/
# /target/<target_canonical_name>/etl-operation/<operation_pk>/cancel/
nested_operations_router = NestedDefaultRouter(root_router, r'target', lookup='target')
nested_operations_router.register(r'etl-operation', OperationView, 'etl-operation')

# /target/<target_canonical_name>/etl-executor/
# /target/<target_canonical_name>/etl-executor/<executor_name>/
# /target/<target_canonical_name>/etl-executor/<executor_name>/group/
# /target/<target_canonical_name>/etl-executor/<executor_name>/source/
# /target/<target_canonical_name>/etl-executor/<executor_name>/series/
# /target/<target_canonical_name>/etl-executor/<executor_name>/parameter/
nested_target_router.register(r'etl-executor', ExecutorView, 'executor')

# /form-case/
# /form-case/<case_pk>/
root_router.register(r'form-case', FormCaseView, 'form-case')

# router nested in /form-case/<form_case_pk>/
nested_form_case_router = NestedDefaultRouter(root_router, r'form-case', lookup='form_case')

# /form-case/<case_pk>/document/
# /form-case/<case_pk>/document/<document_pk>/
nested_form_case_router.register(r'document', FormCaseDocumentView, 'form-case-document')

# /form-case/<case_pk>/comment/
# /form-case/<case_pk>/comment/<comment_pk>/
nested_form_case_router.register(r'comment', FormCaseCommentView, 'form-case-comment')

# /template/
# /template/<canonical_name>/
# /template/<canonical_name/graph/
root_router.register(r'template', TemplateView, 'template')

# /manifest/
# /manifest/<name>/
root_router.register(r'manifest', ManifestView, 'manifest')

# /target/<target_canonical_name>/template/
# /target/<target_canonical_name>/template/<canonical_name>/
# /target/<target_canonical_name>/template/<canonical_name>/graph/
# /target/<target_canonical_name>/template/<canonical_name>/scope/
nested_target_router.register(r'template', NestedTemplateView, 'target-template')

# /zone/
# /zone/_count/
root_router.register(r'zone', ZoneListView, 'zone')

# /user/
root_router.register(r'user', UserView, 'user')

urlpatterns = [
    *root_router.urls,
    *nested_target_router.urls,
    *nested_status_router.urls,
    *nested_timeseries_router.urls,
    *nested_ticket_router.urls,
    *nested_ticket_comment_router.urls,
    *nested_authorization_request_router.urls,
    *nested_form_router.urls,
    *nested_operations_router.urls,
    *nested_form_instance_router.urls,
    *nested_form_case_router.urls,
    *nested_disconnection_router.urls,
    *nested_manual_alert_router.urls,
    *nested_camera_router.urls,
    path("auth/token/", CustomTokenObtainPairView.as_view(), name='token-get'),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name='token-refresh'),
]

app_name = 'api'
