from django.db.models import Q
from alerts.modules import base
from alerts.modules.ef.m1_m2.presencia_grietas.base import PresenciaGrietasController
from alerts.modules.utils import single_state_create
from alerts.modules.base_states import EVENT_STATES
from base.fields import StringEnum


class Controller(PresenciaGrietasController):
    states = StringEnum(*EVENT_STATES, "B1")

    TEMPLATE = "ef-mvp.m1.triggers.grietas"

    relevant_events = [base.event_query(Q(template_name=TEMPLATE), 1)]

    create = single_state_create("B1")
