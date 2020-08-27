from alerts.spreads import spread_sectors
from base.fields import StringEnum
from .base import ErosionInternaController
from alerts.modules.base_states import EVENT_STATES
from alerts.modules.utils import single_state_create
from alerts.modules.event_types import FAILURE_SCENARIO

PROFILE_DESCRIPTIONS = {
    "D1": "Se detecta subsidencia o un socavón en el muro, combinado con una \
    alta presión de poros, turbidez en el sistema de drenaje, aparición de grietas \
    o reducción de la distancia entre la laguna de aguas claras y el muro.\n\n\
    Recomendación: Detener todas las actividades operacionales y ejecutar el plan \
    de evacuación. Además, activar una revisión remota (por ejemplo, vuelos de \
    dron, cámaras y aumentar frecuencia de monitoreo de todas las variables \
    automáticas) y planificar visitas de inspección una vez conocidos y controlados \
    los riesgos identificados en la revisión. Finalmente, el responsable del \
    depósito por parte de la Compañía Minera debe considerar las gestiones \
    necesarias dado que este evento está asociado a una Alerta Roja."
}


@spread_sectors()
class Controller(ErosionInternaController):
    name = "Erosión interna producto de aparición de subsidencias en el muro. "

    event_type = FAILURE_SCENARIO

    states = StringEnum(*EVENT_STATES, 'D1')

    visibility_groups = (
        *ErosionInternaController.visibility_groups,
        "ef.m2.escenarios_falla.eventos_erosion_interna.subsidencias_muro",
    )

    _relevant_events = ["D1"]

    TEMPLATE = 'ef-mvp.m2.failure_scenarios.ei-03'

    def result_state(self, ticket):
        if ticket.state == self.CLOSED_STATE:
            return self.no_result_state
        return {
            "level": self.get_level(ticket),
            'short_message': '',
            'message': PROFILE_DESCRIPTIONS.get(ticket.state, ''),
            'event_type': self.event_type,
            "parameter": self.name
        }

    create = single_state_create("D1")
