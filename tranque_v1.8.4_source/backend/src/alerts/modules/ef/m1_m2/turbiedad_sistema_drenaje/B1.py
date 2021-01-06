from django.db.models import Q
from alerts.modules import base
from alerts.modules.ef.m1_m2.turbiedad_sistema_drenaje.base import TurbiedadSistemaDrenajeController
from alerts.modules.utils import single_state_create
from alerts.modules.base_states import EVENT_STATES
from alerts.modules.event_types import DAILY_INSPECTION
from base.fields import StringEnum


class Controller(TurbiedadSistemaDrenajeController):
    states = StringEnum(*EVENT_STATES, "B1")

    event_type = DAILY_INSPECTION

    TEMPLATE = "ef-mvp.m1.triggers.turbiedad"

    relevant_events = [base.event_query(Q(template_name=TEMPLATE), 1)]

    create = single_state_create("B1")