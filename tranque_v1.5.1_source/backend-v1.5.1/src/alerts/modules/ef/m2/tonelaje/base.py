from django.db.models import Q
from django.utils.decorators import classproperty
from alerts.modules.ef.m2.base import M2BaseController

PROFILE_DESCRIPTIONS = {
    'A1': 'Plan de depositación (Fecha) más Error Permitido es mayor o igual a Tonelaje (Fecha).',
    'A2': 'Plan de depositación (Fecha) más Error Permitido es menor o igual a Tonelaje (Fecha).',
    'B1': 'Tonelaje es mayor al Valor umbral.'
}


class TonelajeController(M2BaseController):
    name = "Tonelaje de relaves o lamas depositados en la cubeta y el muro"

    visibility_groups = (
        *M2BaseController.visibility_groups,
        "ef.m2.tonelaje"
    )

    @classproperty
    def relevant_events(cls):
        return [
            cls.event_query(Q(template_name='.'.join([
                'ef-mvp.m2.parameters.tonelaje',
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
            "parameter": "tonnage"
        }
