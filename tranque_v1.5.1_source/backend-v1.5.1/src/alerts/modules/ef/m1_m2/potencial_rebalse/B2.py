from django.db.models import Q
from alerts.modules import base
from alerts.modules.ef.m1_m2.potencial_rebalse.base import PotencialRebalseController
from alerts.modules.utils import single_state_create
from alerts.modules.base_states import EVENT_STATES
from base.fields import StringEnum


class Controller(PotencialRebalseController):
    states = StringEnum(*EVENT_STATES, "B2")

    TEMPLATE = "ef-mvp.m1.triggers.important.lluvia"

    relevant_events = [base.event_query(Q(template_name=TEMPLATE), 1)]

    create = single_state_create("B2")
