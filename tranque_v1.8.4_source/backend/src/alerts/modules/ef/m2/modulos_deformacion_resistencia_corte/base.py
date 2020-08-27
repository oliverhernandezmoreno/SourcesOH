from django.db.models import Q
from django.utils.decorators import classproperty
from alerts.modules.ef.ef_event import EFEventController
from alerts.modules.event_types import CRITICAL_PARAMETERS, DOCUMENTS

PROFILE_DESCRIPTIONS = {
    'B1': 'Se detecta que el módulo de deformación o los parámetros de resistencia \
    al corte del material de relleno del muro no cumplen con las especificaciones \
    de diseño.\n\n\
    Recomendación: Revisar y verificar el diseño del depósito e informar al superior \
    a cargo, además de reportar en un documento la evidencia del hallazgo, su cuantificación \
    y fecha de ocurrencia.',

    'B2': 'Por medio de un ensayo de penetración realizado en el muro del depósito, \
    se detecta la existencia de un estrato que no cumple con los criterios de \
    densidad especificados por diseño.\n\n\
    Recomendación: Revisar y verificar el diseño del depósito e informar al superior \
    a cargo, además de reportar en un documento la evidencia del hallazgo, su \
    cuantificación y fecha de ocurrencia.',

    'C1': 'El módulo de deformación o los parámetros de resistencia al corte de \
    un estrato detectado en el muro permanece en desacuerdo con lo especificado \
    en el diseño por un tiempo mayor al máximo permitido antes de activar una \
    Alerta Amarilla.\n\n\
    Recomendación: Revisar y verificar el diseño del depósito, informar al \
    superior a cargo, consultar el manual de emergencia y si no está considerado \
    en el manual consultar a un asesor experto en esa materia según los procedimientos \
    establecidos. Además, se sugiere reportar en un documento la evidencia del \
    hallazgo, su cuantificación y fecha de ocurrencia. Finalmente, el responsable \
    del depósito por parte de la Compañía Minera debe considerar las gestiones \
    necesarias dado que este evento está asociado a una Alerta Amarilla.',

    'C2': 'Se determina que los resultados de ensayos de penetración realizados \
    en el muro del depósito ponen en peligro la estabilidad del depósito debido \
    a las dimensiones de la zona afectada.\n\n\
    Recomendación: Revisar y verificar el diseño del depósito, informar al \
    superior a cargo, consultar el manual de emergencia y si no está considerado \
    en el manual consultar a un asesor experto en esa materia según los procedimientos \
    establecidos. Además, se sugiere reportar en un documento la evidencia del \
    hallazgo, su cuantificación y fecha de ocurrencia y restringir las operaciones \
    en los sectores aledaños. Finalmente, el responsable del depósito por parte de \
    la Compañía Minera debe verificar el estado de los escenarios de falla de \
    inestabilidad de talud IT-03, IT-04 junto con considerar las gestiones \
    necesarias dado que este evento está asociado a una Alerta Amarilla.',

    'D1': 'Se determina que el sector que no cumple con la densidad especificada \
    en el diseño se encuentra bajo el nivel freático o con un nivel alto de \
    saturación.\n\n\
    Recomendación: Detener todas las actividades operacionales y ejecutar el plan \
    de evacuación. Además, activar una revisión remota (por ejemplo, vuelos de \
    dron, cámaras y aumentar frecuencia de monitoreo de todas las variables \
    automáticas) y planificar visitas de inspección una vez conocidos y controlados \
    los riesgos identificados en la revisión. Finalmente, el responsable del depósito \
    por parte de la Compañía Minera debe verificar el estado del escenario de \
    falla de inestabilidad de talud IT-03 junto con considerar las gestiones necesarias \
    dado que este evento está asociado a una Alerta Roja.',
}


class ModulosDeformacionController(EFEventController):
    name = "Módulos de deformación y resistencia al corte del material \
    de relleno del muro del depósito. "

    visibility_groups = (
        "ef",
        "m1",
        "ef.m2",
        "ef.m2.modulos_deformacion_resistencia_corte",
        "mine",
        "authority"
    )

    @classproperty
    def relevant_events(cls):
        group = cls.spread_object()
        return [
            cls.event_query(Q(canonical_name='.'.join([
                group.target.canonical_name,
                f'g-{group.canonical_name}',
                'ef-mvp.m2.parameters.modulos-deformacion-resistencia-muro',
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
            "event_type": CRITICAL_PARAMETERS,
            "parameter": DOCUMENTS
        }
