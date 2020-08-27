from django.db.models import Q
from django.utils.decorators import classproperty
from alerts.modules.ef.ef_event import EFEventController

PROFILE_DESCRIPTIONS = {
    'A1': 'Mínima distancia laguna-muro < Primer valor umbral',
    'B1': 'La laguna se desplaza por sectores irregulares o se forman lagunas \
           secundarias en sectores distintos a la laguna principal.',
    'B2': 'Mínima distancia laguna-muro < Segundo valor umbral',
    'C1': 'Mínima distancia laguna-muro <= Tercer valor umbral'
}


class DistanciaMuroLagunaController(EFEventController):
    name = "Distancia mínima al muro de la laguna aguas claras"

    visibility_groups = (
        "ef",
        "m1",
        "ef.m1_m2",
        "ef.m1_m2.distancia_minima_muro_laguna",
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
                'ef-mvp.m2.parameters.distancia-laguna',
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
            "reason": "exceed",
            "parameter": "topography"
        }
