from django.db.models import Q
from django.utils.decorators import classproperty
from alerts.modules.ef.m2.base import M2BaseController
from alerts.modules.event_types import CRITICAL_PARAMETERS, TONNAGE

PROFILE_DESCRIPTIONS = {
    'A1': 'Se detecta que el tonelaje de relaves o lamas depositado en la cubeta y el muro es menor que \
    el plan de depositación más la banda de tolerancia permitida.\n\n\
    Recomendación: Verificar la ocurrencia y la extensión del evento descrito, además de las posibles \
    consecuencias en la revancha operacional.',

    'A2': 'Se detecta que el tonelaje de relaves o lamas depositado en la cubeta y muro supera el plan de \
    depositación más la banda de tolerancia permitida.\n\n\
    Recomendación: Verificar la ocurrencia y la extensión del evento descrito, además de las posibles \
    consecuencias en la revancha operacional.',

    'B1': 'Se detecta que el tonelaje de relaves o lamas depositado en la cubeta y muro (si aplica) supera \
    el valor umbral definido.\n\n\
    Recomendación: Verificar el evento descrito e informar al superior a cargo.'
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
            "event_type": CRITICAL_PARAMETERS,
            "parameter": TONNAGE
        }
