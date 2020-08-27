from django.db.models import Q
from alerts.modules import base
from alerts.modules.ef.ef_event import EFEventController
from alerts.modules.utils import single_state_create
from alerts.modules.base_states import EVENT_STATES
from base.fields import StringEnum


class Controller(EFEventController):
    name = "Distribución inadecuada de lamas o relave en el interior de la cubeta"

    states = StringEnum(*EVENT_STATES, 'A1')

    visibility_groups = (
        "ef",
        "m1",
        "ef.m1",
        "ef.m1.inspeccion_diaria",
        "ef.m1.inspeccion_diaria.eventos_gatilladores",
        "mine"
    )

    TEMPLATE = 'ef-mvp.m1.triggers.distribucion-inadecuada'

    relevant_events = [base.event_query(Q(template_name=TEMPLATE), 1)]

    def result_state(self, ticket):
        if ticket.state == self.CLOSED_STATE:
            return {'level': 0, 'short_message': self.name}
        return {
            'level': self.get_level(ticket),
            'short_message': self.name,
            'message': 'Depositación inadecuada de lamas o relave al interior de la cubeta,\
                        que tenga como consecuencia que el volumen almacenado quede mal distribuido.',
            "reason": "byUser",
            "parameter": "inspections"
        }

    create = single_state_create("A1")
