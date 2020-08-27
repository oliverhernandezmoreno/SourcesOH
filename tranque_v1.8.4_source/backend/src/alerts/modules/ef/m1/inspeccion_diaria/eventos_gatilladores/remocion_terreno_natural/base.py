from django.db.models import Q
from django.utils.decorators import classproperty
from alerts.modules.ef.ef_event import EFEventController
from alerts.modules.event_types import DAILY_INSPECTION


PROFILE_DESCRIPTIONS = {
    'C1': 'Se detecta una remoción en masa del terreno natural colindante al \
    depósito sobre el muro o sobre instalaciones, poniendo en riesgo la operación \
    o la integridad del muro.\n\n\
    Recomendación: Confirmar la ocurrencia del evento identificado a través de \
    registros fotográficos o de la medición de alguna variable de monitoreo \
    relacionada e informar al superior a cargo. Registrar posibles causas que \
    sean evidentes de una inspección visual, el lugar, la extensión, y la data \
    estimada del problema. Restringir las operaciones en los sectores aledaños, \
    consultar el manual de emergencia y, si no está considerado en el manual, \
    consultar a un asesor experto en esa materia según los procedimientos establecidos. \
    Además, el responsable del depósito por parte de la Compañía Minera debe \
    considerar las gestiones necesarias dado que este evento está asociado a una \
    Alerta Amarilla.',

    'D1': 'Se detecta una remoción en masa producto de un deslizamiento del \
    terreno natural colindante al depósito sobre el muro o sobre instalaciones, \
    poniendo en riesgo la operación o la integridad del muro debido a la incerteza \
    asociada al grado de daños provocados.\n\n\
    Recomendación: Detener todas las actividades operacionales y ejecutar el plan de evacuación. \
    Además, activar una revisión remota (por ejemplo, vuelos de dron, cámaras y aumentar \
    frecuencia de monitoreo de todas las variables automáticas) y planificar visitas \
    de inspección una vez conocidos y controlados los riesgos identificados en la \
    revisión. Finalmente, el responsable del depósito por parte de la Compañía Minera \
    debe considerar las gestiones necesarias dado que este evento está asociado a \
    una Alerta Roja.',
}


class RemocionTerrenoController(EFEventController):
    name = "Remoción en masa del terreno natural hacia el muro o hacia sectores críticos."

    event_type = DAILY_INSPECTION

    visibility_groups = (
        "ef",
        "m1",
        "ef.m1.",
        "ef.m1.inspeccion_diaria",
        "ef.m1.inspeccion_diaria.eventos_gatilladores",
        "ef.m1.inspeccion_diaria.eventos_gatilladores.remocion_terreno_natural",
        "mine",
        "authority"
    )

    TEMPLATE = "ef-mvp.m1.triggers.critical.deslizamiento-critico"

    @classproperty
    def relevant_events(cls):
        return [
            cls.event_query(Q(template_name='.'.join([
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
            'short_message': self.name,
            'message': PROFILE_DESCRIPTIONS.get(ticket.state, ''),
            "event_type": self.event_type,
        }
