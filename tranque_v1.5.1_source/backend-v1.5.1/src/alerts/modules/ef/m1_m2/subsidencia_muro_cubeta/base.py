from django.db.models import Q
from django.utils.decorators import classproperty
from alerts.modules.ef.ef_event import EFEventController

PROFILE_DESCRIPTIONS = {
    'B1': 'Se activó el evento gatillador fenómeno de subsidencia o \
    socavón en el muro del depósito. ',
    'B2': 'Si activó el evento gatillador fenómeno de subsidencia o \
    socavón en la cubeta del depósito. ',
    'C1': 'El fenómeno de subsidencia o socavón registrado pone \
    en riesgo la integridad del muro',
    'C2': 'Se dectaron fenómenos de subsidencia o socavón \
    posterior a un evento sísmico y se determina que éstos ponen \
    en riesgo la integridad del muro. '
}


class SubsidenciaMuroCubetaController(EFEventController):
    name = "Fenómeno de subsidencia o socavación en el muro o en la cubeta \
    cercana al muro. "

    visibility_groups = (
        "ef",
        "m1",
        "ef.m1_m2",
        "ef.m1_m2.subsidencia_muro_cubeta",
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
                'ef-mvp.m2.parameters.integridad-externa.subsidencia.muro',
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
            "reason": "combined",
            "parameter": "deformation"
        }
