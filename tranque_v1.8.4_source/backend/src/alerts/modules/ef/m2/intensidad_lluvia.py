from django.db.models import Q
from alerts.modules import base
from alerts.modules.ef.m2.base import M2BaseController
from alerts.modules.utils import single_state_create
from alerts.modules.base_states import EVENT_STATES
from alerts.modules.event_types import CRITICAL_PARAMETERS, OVERFLOW_POTENTIAL
from base.fields import StringEnum


class Controller(M2BaseController):
    name = "Intensidad de lluvia"

    description = "Se detecta que la intensidad de lluvia estimada supera el valor umbral, \
                que afecta la capacidad de regulación de agua del depósito.\n\n \
                Recomendación: Verificar el evento descrito, informar al superior a cargo y \
                revisar la interfaz del Potencial de Rebalse para la toma de decisiones."

    states = StringEnum(*EVENT_STATES, 'B1')

    visibility_groups = (
        *M2BaseController.visibility_groups,
        "ef.m2.intensidad_lluvia",
    )

    TEMPLATE = 'ef-mvp.m2.parameters.lluvia.B1'

    relevant_events = [base.event_query(Q(template_name=TEMPLATE), 1)]

    def result_state(self, ticket):
        if ticket.state == self.CLOSED_STATE:
            return {'level': 0, 'short_message': self.name}
        return {
            'level': self.get_level(ticket),
            'short_message': self.name,
            'message': self.description,
            "event_type": CRITICAL_PARAMETERS,
            "parameter": OVERFLOW_POTENTIAL
        }

    create = single_state_create("B1")
