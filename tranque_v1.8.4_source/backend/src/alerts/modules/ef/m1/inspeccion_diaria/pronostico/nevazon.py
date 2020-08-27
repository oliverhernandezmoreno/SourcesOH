from django.db.models import Q
from alerts.modules import base
from alerts.modules.ef.ef_event import EFEventController
from alerts.modules.utils import single_state_create
from alerts.modules.base_states import EVENT_STATES
from alerts.modules.event_types import DAILY_INSPECTION, INSPECTIONS
from base.fields import StringEnum


class Controller(EFEventController):
    name = "Pronóstico de nevazón."

    states = StringEnum(*EVENT_STATES, 'B1')

    visibility_groups = (
        "ef",
        "m1",
        "ef.m1",
        "ef.m1.inspeccion_diaria",
        "ef.m1.inspeccion_diaria.pronostico",
        "mine"
    )

    TEMPLATE = 'ef-mvp.m1.triggers.forecasts.nevazon'

    relevant_events = [base.event_query(Q(template_name=TEMPLATE), 1)]

    def result_state(self, ticket):
        if ticket.state == self.CLOSED_STATE:
            return self.no_result_state
        return {
            "level": self.get_level(ticket),
            "short_message": self.name,
            "message": "Existe un pronóstico de nevazón.",
            "event_type": DAILY_INSPECTION,
            "parameter": INSPECTIONS
        }
    create = single_state_create("B1")
