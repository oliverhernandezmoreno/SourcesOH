from django.db.models import Q
from django.utils.decorators import classproperty
from alerts.modules.ef.ef_event import EFEventController

PROFILE_DESCRIPTIONS = {
    'A1': 'Plan de crecimiento (Fecha) + Error Permitido <= Valor Altura de muro (Fecha)',
    'A2': 'Plan de crecimiento (Fecha) - Error Permitido >= Valor Altura de muro (Fecha)',
    'A3': 'Existen sectores con alturas irregulares producto de un crecimiento excesivo o que,\
           al contrario, están por debajo de la altura general del muro.'
}


class AlturaCoronamientoController(EFEventController):

    name = "Cambio en altura de muro"

    visibility_groups = (
        "ef",
        "m1",
        "ef.m1_m2",
        "ef.m1_m2.altura_coronamiento",
        "mine",
    )

    @classproperty
    def relevant_events(cls):
        group = cls.spread_object()
        return [
            cls.event_query(Q(canonical_name='.'.join([
                group.target.canonical_name,
                f'g-{group.canonical_name}',
                'ef-mvp.m2.parameters.altura-muro.sector',
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
