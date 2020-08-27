from django.db.models import Q
from alerts.modules import base
from alerts.modules.ef.m1_m2.distancia_minima_muro_laguna.base import DistanciaMuroLagunaController
from alerts.modules.utils import single_state_create
from alerts.modules.base_states import EVENT_STATES
from alerts.modules.event_types import DAILY_INSPECTION
from base.fields import StringEnum


class Controller(DistanciaMuroLagunaController):
    name = "Ubicación y tamaño de la laguna"

    event_type = DAILY_INSPECTION

    states = StringEnum(*EVENT_STATES, "B1")

    TEMPLATE = "ef-mvp.m1.design.laguna"

    relevant_events = [base.event_query(Q(template_name=TEMPLATE), 1)]

    create = single_state_create("B1")
