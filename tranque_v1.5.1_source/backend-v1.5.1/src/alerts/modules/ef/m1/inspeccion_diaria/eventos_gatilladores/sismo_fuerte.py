from django.db.models import Q
from alerts.modules import base
from alerts.modules.ef.ef_event import EFEventController
from alerts.modules.utils import single_state_create
from alerts.modules.base_states import EVENT_STATES
from base.fields import StringEnum


class Controller(EFEventController):
    name = "Sismo fuerte (Terremoto, operador no se puede mantener en pie)"

    states = StringEnum(*EVENT_STATES, 'C1')

    visibility_groups = (
        "ef",
        "m1",
        "ef.m1",
        "ef.m1.inspeccion_diaria",
        "ef.m1.inspeccion_diaria.eventos_gatilladores",
        "mine"
    )

    TEMPLATE = 'ef-mvp.m1.triggers.critical.terremoto-7'

    relevant_events = [base.event_query(Q(template_name=TEMPLATE), 1)]

    def result_state(self, ticket):
        if ticket.state == self.CLOSED_STATE:
            return self.no_result_state
        return {
            "level": self.get_level(ticket),
            "short_message": self.name,
            "message": "Corresponde a un sismo mayor, que genera un \
            movimiento lo suficientemente fuerte para que un operador \
            pierda por completo su estabilidad y no pueda continuar en pie.",
            "reason": "exceed",
            "parameter": "inspections"
        }

    create = single_state_create("C1")
