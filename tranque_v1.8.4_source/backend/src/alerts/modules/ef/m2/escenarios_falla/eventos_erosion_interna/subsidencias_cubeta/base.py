from alerts.modules.event_types import FAILURE_SCENARIO
from alerts.modules.ef.m2.escenarios_falla.eventos_erosion_interna.base import ErosionInternaController

PROFILE_DESCRIPTIONS = {
    'C1': 'Se detecta un socavón o subsidencia en la cubeta, cerca del muro, \
    combinado con una reducción de la distancia entre la laguna de aguas claras \
    y el muro.\n\n\
    Recomendación: Informar al superior a cargo, consultar el manual de emergencia \
    y, si no está considerado en el manual, consultar a un asesor experto en esa \
    materia se según los procedimientos establecidos. Se sugiere reportar en un \
    documento la evidencia del hallazgo, su cuantificación y fecha de ocurrencia. \
    Además, el responsable del depósito por parte de la Compañía Minera debe \
    considerar las gestiones necesarias dado que este evento está asociado a una \
    Alerta Amarilla.',

    'D1': 'Se detecta un socavón o subsidencia en la cubeta, cerca del muro, \
    combinado con una reducción de la distancia entre la laguna de aguas claras \
    y el muro. El operador ha confirmado manualmente el escenario de falla.\n\n\
    Recomendación: Detener todas las actividades operacionales y ejecutar el \
    plan de evacuación. Además, activar una revisión remota (por ejemplo, vuelos \
    de dron, cámaras y aumentar frecuencia de monitoreo de todas las variables \
    automáticas) y planificar visitas de inspección una vez conocidos y controlados \
    los riesgos identificados en la revisión. Finalmente, el responsable del \
    depósito por parte de la Compañía Minera debe considerar las gestiones necesarias \
    dado que este evento está asociado a una Alerta Roja.',
}


class SubsidenciasCubetaController(ErosionInternaController):
    name = "Erosión interna producto de subsidencias en la cubeta del muro. "

    event_type = FAILURE_SCENARIO

    visibility_groups = (
        *ErosionInternaController.visibility_groups,
        "ef.m2.escenarios_falla.eventos_erosion_interna.subsidencias_cubeta",
    )

    _relevant_events = ['C1', 'D1']

    TEMPLATE = 'ef-mvp.m2.failure_scenarios.ei-02'

    def result_state(self, ticket):
        if ticket.state == self.CLOSED_STATE:
            return {'level': 0, 'short_message': self.name}
        return {
            'level': self.get_level(ticket),
            'short_message': self.name,
            'message': PROFILE_DESCRIPTIONS.get(ticket.state, ''),
            'event_type': self.event_type,
            "parameter": self.name
        }
