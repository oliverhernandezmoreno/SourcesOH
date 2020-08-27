from django.db.models import Q
from alerts.modules import base
from .base import RevanchaOperacionalController
from alerts.modules.utils import single_state_create
from alerts.modules.base_states import EVENT_STATES
from base.fields import StringEnum


class Controller(RevanchaOperacionalController):
    name = "Revancha operacional e hidráulica"

    states = StringEnum(*EVENT_STATES, "A1")

    TEMPLATE = "ef-mvp.m1.design.revancha"

    relevant_events = [base.event_query(Q(template_name=TEMPLATE), 1)]

    create = single_state_create("A1")
