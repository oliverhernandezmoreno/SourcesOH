from django.db.models import Q
from alerts.modules.base_states import EVENT_STATES
from base.fields import StringEnum
from alerts.modules import base
from alerts.modules.ef.m1_m2.integridad_estribos.base import IntegridadEstribosController
from alerts.modules.utils import single_state_create
from alerts.modules.event_types import DAILY_INSPECTION


class Controller(IntegridadEstribosController):
    states = StringEnum(*EVENT_STATES, "B1")

    event_type = DAILY_INSPECTION

    TEMPLATE = "ef-mvp.m1.triggers.estribo"

    relevant_events = [base.event_query(Q(template_name=TEMPLATE), 1)]

    create = single_state_create("B1")