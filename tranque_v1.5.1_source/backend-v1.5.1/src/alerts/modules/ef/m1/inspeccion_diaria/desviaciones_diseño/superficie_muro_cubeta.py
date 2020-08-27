from django.db.models import Q
from alerts.modules import base
from alerts.modules.ef.ef_event import EFEventController
from alerts.modules.utils import single_state_create
from alerts.modules.base_states import EVENT_STATES
from base.fields import StringEnum


class Controller(EFEventController):
    name = "Superficie del muro y cubeta del depósito"

    states = StringEnum(*EVENT_STATES, 'A1')

    visibility_groups = (
        "ef",
        "m1",
        "ef.m1",
        "ef.m1.inspeccion_diaria",
        "ef.m1.inspeccion_diaria.desviaciones_diseño",
        "mine"
    )

    TEMPLATE = 'ef-mvp.m1.design.superficie'

    relevant_events = [base.event_query(Q(template_name=TEMPLATE), 1)]

    def result_state(self, ticket):
        if ticket.state == self.CLOSED_STATE:
            return {'level': 0, 'short_message': self.name}
        return {
            'level': self.get_level(ticket),
            'short_message': self.name,
            'message': 'La deposición de lamas y el crecimiento del muro están aumentando\
                        de forma irregular.',
            "reason": "byUser",
            "parameter": "inspections"
        }

    create = single_state_create("A1")
