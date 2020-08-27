from django.db.models import Q
from django.utils.decorators import classproperty
from alerts.modules.ef.ef_event import EFEventController
from alerts.modules.event_types import DAILY_INSPECTION

PROFILE_DESCRIPTIONS = {
    'C1': 'Se detecta un deslizamiento significativo de material superficial del \
    muro, de un área mayor a aproximadamente 100 [m 2 ], que afecta la geometría \
    de los taludes en un sector aguas arriba o aguas abajo.\n\n\
    Recomendación: Confirmar la ocurrencia del evento identificado a través \
    de registros fotográficos o de la medición de alguna variable de monitoreo \
    relacionada e informar al superior a cargo. Registrar posibles causas que \
    sean evidentes de una inspección visual el lugar, la extensión, y la data \
    estimada del problema. Restringir las operaciones en los sectores involucrados, \
    consultar el manual de emergencia y, si no está considerado en el manual, \
    consultar a un asesor experto en esa materia según los procedimientos establecidos. \
    Además, el responsable del depósito por parte de la Compañía Minera debe verificar \
    el estado del escenario de falla de inestabilidad de talud IT-06 junto con \
    considerar las gestiones necesarias dado que este evento está asociado a una \
    Alerta Amarilla.',

    'D1': 'Se detecta un deslizamiento significativo de material superficial del \
    muro, de un área mayor a aproximadamente 100 [m 2 ], que afecta la geometría de \
    los taludes en un sector aguas arriba o aguas abajo, lo cual indica que existe \
    un deslizamiento de la capa superficial del material del muro.\n\n\
    Recomendación: Detener todas las actividades operacionales y ejecutar el plan \
    de evacuación. Además, activar una revisión remota (por ejemplo, vuelos de dron, \
    cámaras y aumentar frecuencia de monitoreo de todas las variables automáticas) \
    y planificar visitas de inspección una vez conocidos y controlados los riesgos \
    identificados en la revisión. Finalmente, el responsable del depósito por parte \
    de la Compañía Minera debeconsiderar las gestiones necesarias dado que este \
    evento está asociado a una Alerta Roja.',

}


class DeslizamientoGeometriaTaludesController(EFEventController):
    name = "Deslizamiento significativo de material superficial del muro \
    que afecta la geometría de los taludes"

    event_type = DAILY_INSPECTION

    visibility_groups = (
        "ef",
        "m1",
        "ef.m1.",
        "ef.m1.inspeccion_diaria",
        "ef.m1.inspeccion_diaria.eventos_gatilladores",
        "ef.m1.inspeccion_diaria.eventos_gatilladores.deslizamiento_geometria_taludes",
        "mine",
        "authority"
    )

    TEMPLATE = "ef-mvp.m1.triggers.critical.deslizamiento-mayor"

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
