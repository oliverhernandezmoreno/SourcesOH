from django.db.models import Q
from alerts.modules import base
from alerts.modules.ef.m1_m2.altura_coronamiento.base import AlturaCoronamientoController
from alerts.modules.utils import single_state_create
from alerts.modules.base_states import EVENT_STATES
from alerts.modules.event_types import DAILY_INSPECTION
from base.fields import StringEnum


class Controller(AlturaCoronamientoController):
    name = "Altura de coronamiento"

    event_type = DAILY_INSPECTION

    states = StringEnum(*EVENT_STATES, "A3")

    TEMPLATE = "ef-mvp.m1.design.altura"

    relevant_events = [base.event_query(Q(template_name=TEMPLATE), 1)]

    create = single_state_create("A3")
