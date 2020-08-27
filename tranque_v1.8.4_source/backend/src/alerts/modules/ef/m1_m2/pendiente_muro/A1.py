from django.db.models import Q
from alerts.modules import base
from .base import PendienteMuroController
from alerts.modules.utils import single_state_create
from alerts.modules.base_states import EVENT_STATES
from alerts.modules.event_types import DAILY_INSPECTION, TOPOGRAPHY
from base.fields import StringEnum


class Controller(PendienteMuroController):
    name = "Se activa el evento asociado a la desviación del diseño “Inclinación\
     de talud aguas abajo y aguas arriba del muro"

    event_type = DAILY_INSPECTION

    states = StringEnum(*EVENT_STATES, "A1")

    TEMPLATE = "ef-mvp.m1.design.talud"

    relevant_events = [base.event_query(Q(template_name=TEMPLATE), 1)]

    def result_state(self, ticket):
        if ticket.state == self.CLOSED_STATE:
            return self.no_result_state
        return {
            "level": self.get_level(ticket),
            "short_message": self.name,
            "message": self.name,
            "event_type": self.event_type,
            "parameter": TOPOGRAPHY
        }

    create = single_state_create("A1")
