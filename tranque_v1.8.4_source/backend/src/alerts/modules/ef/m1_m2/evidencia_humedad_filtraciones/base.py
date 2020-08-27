from django.db.models import Q
from django.utils.decorators import classproperty
from alerts.modules.ef.ef_event import EFEventController
from alerts.modules.event_types import CRITICAL_PARAMETERS, PCIE

PROFILE_DESCRIPTIONS = {
    'B1': 'Se activó el evento gatillador presencia de filtraciones o humedad',
    'C1': 'Se determina que las filtraciones o humedad ponen en riesgo la \
    integridad del muro',
    'C2': 'Se detectan filtraciones o humedad posterior a un evento sísmico \
     y se determina que éstas ponen en riesgo la integridad del muro',

}


class EvidenciaHumedadFiltracionesController(EFEventController):
    name = "Evidencia de humedad y/o filtraciones en talud de aguas abajo del muro."

    event_type = CRITICAL_PARAMETERS

    visibility_groups = (
        "ef",
        "m1",
        "ef.m1_m2",
        "ef.m1_m2.evidencia_humedad_filtraciones",
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
                'ef-mvp.m2.parameters.integridad-externa.filtraciones',
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
            "parameter": PCIE
        }
