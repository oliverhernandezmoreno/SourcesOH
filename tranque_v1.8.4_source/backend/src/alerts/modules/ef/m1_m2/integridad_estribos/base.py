from django.db.models import Q
from django.utils.decorators import classproperty
from alerts.modules.ef.ef_event import EFEventController
from alerts.modules.event_types import CRITICAL_PARAMETERS, PCIE

PROFILE_DESCRIPTIONS = {
    'B1': 'Se activó el evento gatillador asociado a la integridad de los estribos',
    'B2': 'El estribo presenta una tendencia desfavorable asociada a su deformación.',
    'C1': 'Se detectan problemas que afectan la estabilidad del estribo asociados \
    a condiciones que específicas.',
    'D1': 'Se detectó un desplazamiento relativo entre el muro y el suelo de fundación. ',
}


class IntegridadEstribosController(EFEventController):
    name = "Cambio en Integridad de Estribos"

    event_type = CRITICAL_PARAMETERS

    visibility_groups = (
        "ef",
        "m1",
        "ef.m1_m2",
        "ef.m1_m2.integridad_estribos",
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
                'ef-mvp.m2.parameters.integridad-externa.estribos',
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
