from django.db.models import Q
from django.utils.decorators import classproperty
from alerts.modules.ef.ef_event import EFEventController
from alerts.modules.event_types import FAILURE_SCENARIO


PROFILE_DESCRIPTIONS = {
    'C1': 'Se detecta que la pendiente de una playa es superior a lo indicado por \
    el diseño, combinado con un alto nivel freático en la cubeta y un volumen de \
    relaves depositados superior a la capacidad máxima de la cubeta, si los relaves \
    fueron depositados horizontalmente.\n\n\
    Recomendación: Informar al superior a cargo, consultar el manual de emergencia \
    y, si no está considerado en el manual, consultar a un asesor experto en esa \
    materia se según los procedimientos establecidos. Se sugiere reportar en un \
    documento la evidencia del hallazgo, su cuantificación y fecha de ocurrencia.\
    Además, el responsable del depósito por parte de la Compañía Minera debe considerar \
    las gestiones necesarias dado que este evento está asociado a una Alerta Amarilla.',

    'D1': 'Se detecta, por medios visuales, que la pendiente de una playa es \
    superior a lo indicado por el diseño, combinado con un alto nivel freático \
    en la cubeta, y un volumen de relaves depositados superior a la capacidad \
    máxima de la cubeta, si los relaves fueron depositados horizontalmente. El \
    operador ha confirmado manualmente el escenario de falla.\n\n\
    Recomendación: Detener todas las actividades operacionales y ejecutar el plan \
    de evacuación. Además, activar una revisión remota (por ejemplo, vuelos de \
    dron, cámaras y aumentar frecuencia de monitoreo de todas las variables \
    automáticas) y planificar visitas de inspección una vez conocidos y controlados \
    los riesgos identificados en la revisión. Finalmente, el responsable del \
    depósito por parte de la Compañía Minera debe considerar las gestiones \
    necesarias dado que este evento está asociado a una Alerta Roja.',
}


class LicuefaccionCubetaController(EFEventController):
    name = "Rebalse de relaves producto de licuefacción de la cubeta. "

    event_type = FAILURE_SCENARIO

    visibility_groups = (
        "ef",
        "m2",
        "ef.m2",
        "ef.m2.escenarios_falla",
        "ef.m2.escenarios_falla.eventos_rebalse",
        "ef.m2.escenarios_falla.eventos_rebalse.licuefaccion_cubeta",
        "mine",
        "authority"
    )

    TEMPLATE = 'ef-mvp.m2.failure_scenarios.re-03'

    @classproperty
    def relevant_events(cls):
        group = cls.spread_object()
        return [
            cls.event_query(Q(canonical_name='.'.join([
                group.target.canonical_name,
                f'g-{group.canonical_name}',
                cls.TEMPLATE,
                suffix
            ])), 1)
            for suffix in cls._relevant_events
        ]

    def result_state(self, ticket):
        if ticket.state == self.CLOSED_STATE:
            return self.no_result_state
        return {
            'level': self.get_level(ticket),
            'short_message': '',
            'message': PROFILE_DESCRIPTIONS.get(ticket.state, ''),
            'event_type': self.event_type,
            "parameter": self.name
        }
