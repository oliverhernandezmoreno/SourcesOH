from django.db.models import Q
from alerts.modules import base
from alerts.modules.ef.ef_event import EFEventController
from alerts.modules.utils import single_state_create
from alerts.modules.base_states import EVENT_STATES
from base.fields import StringEnum


class Controller(EFEventController):
    name = "Situación actual del depósito"

    description = "Autodenuncia de la minera frente a un evento o condición"
    "fuera del funcionamiento normal del depósito."

    states = StringEnum(*EVENT_STATES, 'B1')

    visibility_groups = (
        "ef",
        "m1",
        "ef.m1",
        "ef.m1.inspeccion_mensual",
        "mine",
        "authority"
    )

    TEMPLATE = 'ef-mvp.m1.vulnerability.estado'

    relevant_events = [base.event_query(Q(template_name=TEMPLATE), 1)]

    def result_state(self, ticket):
        if ticket.state == self.CLOSED_STATE:
            return {'level': 0, 'short_message': self.name}
        return {
            'level': self.get_level(ticket),
            'short_message': self.name,
            'message': self.description,
            "reason": "byUser",
            "parameter": "inspections"
        }

    create = single_state_create("B1")
