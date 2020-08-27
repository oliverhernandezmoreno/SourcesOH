from django.db.models import Q
from django.utils.decorators import classproperty
from alerts.modules.ef.ef_event import EFEventController
from alerts.modules.event_types import FAILURE_SCENARIO


PROFILE_DESCRIPTIONS = {
    'C1': 'Se detectan deslizamientos superficiales en un sector del muro, combinado \
    con la aparición de grietas en el mismo sector.\n\n\
    Recomendación: Informar al superior a cargo, consultar el manual de emergencia y, \
    si no está considerado en el manual, consultar a un asesor experto en esa materia \
    se según los procedimientos establecidos. Se sugiere reportar en un documento \
    la evidencia del hallazgo, su cuantificación y fecha de ocurrencia. Además, el \
    responsable del depósito por parte de la Compañía Minera debe considerar las \
    gestiones necesarias dado que este evento está asociado a una Alerta Amarilla.',

    'D1': 'Se detectan deslizamientos superficiales en un sector del muro, combinado \
    con la aparición de grietas en el mismo sector y, a lo menos, la detección de \
    alta presión de poros, la presencia de filtraciones o la reducción de la distancia \
    entre la laguna de aguas claras y el muro.\n\n\
    Recomendación: Detener todas las actividades operacionales y ejecutar el plan de \
    evacuación. Además, activar una revisión remota (por ejemplo, vuelos de dron, \
    cámaras y aumentar frecuencia de monitoreo de todas las variables automáticas) \
    y planificar visitas de inspección una vez conocidos y controlados los riesgos \
    identificados en la revisión. Finalmente, el responsable del depósito por parte de \
    la Compañía Minera debe considerar las gestiones necesarias dado que este evento \
    está asociado a una Alerta Roja.',

    'D2': 'Se detectan deslizamientos superficiales en un sector del muro, combinado \
    con la aparición de grietas en el mismo sector y la detección de una tendencia \
    en el aumento de la presión de poros o directamente la superación de sus valores \
    umbrales. El operador del IEF ha confirmado de forma manual la activación de este \
    escenario de falla.\n\n\
    Recomendación: Detener todas las actividades operacionales y ejecutar el plan \
    de evacuación. Además, activar una revisión remota (por ejemplo, vuelos de dron, \
    cámaras y aumentar frecuencia de monitoreo de todas las variables automáticas) \
    y planificar visitas de inspección una vez conocidos y controlados los riesgos \
    identificados en la revisión. Finalmente, el responsable del depósito por parte \
    de la Compañía Minera debe considerar las gestiones necesarias dado que este \
    evento está asociado a una Alerta Roja.'
}


class DeslizamientoMuroController(EFEventController):
    name = "Inestabilidad por deslizamiento del muro. "

    event_type = FAILURE_SCENARIO

    visibility_groups = (
        "ef",
        "m2",
        "ef.m2",
        "ef.m2.escenarios_falla",
        "ef.m2.escenarios_falla.eventos_inestabilidad_talud",
        "ef.m2.escenarios_falla.eventos_inestabilidad_talud.deslizamiento_muro",
        "mine",
        "authority"
    )

    TEMPLATE = 'ef-mvp.m2.failure_scenarios.it-06'

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
            return {'level': 0, 'short_message': self.name}
        return {
            'level': self.get_level(ticket),
            'short_message': '',
            'message': PROFILE_DESCRIPTIONS.get(ticket.state, ''),
            'event_type': self.event_type,
            "parameter": self.name
        }
