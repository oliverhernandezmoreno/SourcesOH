from alerts.spreads import spread_sectors
from base.fields import StringEnum
from .base import InestabilidadTaludController
from alerts.modules.base_states import EVENT_STATES
from alerts.modules.utils import single_state_create

PROFILE_DESCRIPTIONS = {
    'D1': 'Se detectan problemas en la integridad de los estribos originados por \
    grietas, filtraciones o desplazamientos, combinados con reducción de la \
    distancia entre la laguna de aguas claras y el muro, una alta presión de \
    poros o filtraciones generalizadas en el mismo sector.\n\n\
    Recomendación: Detener todas las actividades operacionales y ejecutar el plan \
    de evacuación. Además, activar una revisión remota (por ejemplo, vuelos de dron, \
    cámaras y aumentar frecuencia de monitoreo de todas las variables automáticas) \
    y planificar visitas de inspección una vez conocidos y controlados los riesgos \
    identificados en la revisión. Finalmente, el responsable del depósito por parte \
    de la Compañía Minera debe considerar las gestiones necesarias dado que este \
    evento está asociado a una Alerta Roja.',
}


@spread_sectors()
class Controller(InestabilidadTaludController):
    name = "Inestabilidad por falta de integridad en estribos. "

    states = StringEnum(*EVENT_STATES, 'D1')

    visibility_groups = (
        *InestabilidadTaludController.visibility_groups,
        "ef.m2.escenarios_falla.eventos_inestabilidad_talud.falta_integridad_estribos",
    )

    _relevant_events = ["D1"]

    TEMPLATE = 'ef-mvp.m2.failure_scenarios.it-05'

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
