from django.db.models import Q
from django.utils.decorators import classproperty
from alerts.modules.ef.ef_event import EFEventController

PROFILE_DESCRIPTIONS = {
    'A1': 'Se detecta un deslizamiento de terreno natural sobre \
           los canales o derrumbe de parte de estos, bloqueo \
           u obstrucción de algún sector del canal.',
    'A2': 'Se detecta un potencial de rebalse mayor a 1 en el pre-cálculo del pronóstico de lluvia.',
    'A3': 'Se detecta un potencial de rebalse entre 0,8 y 1.',
    'B1': 'Se activa evento asociado a pronóstico de lluvia.',
    'B2': 'Se activa evento asociado a lluvia en desarrollo.',
    'B3': 'Tiempo de rebalse es menor que el tiempo de evacuación.',
    'B4': 'El potencial de rebalse es mayor que 1.',
}


class PotencialRebalseController(EFEventController):
    name = "Potencial de Rebalse"

    visibility_groups = (
        "ef",
        "m1",
        "ef.m1_m2",
        "ef.m1_m2.potencial_rebalse",
        "mine",
        "authority"
    )

    TEMPLATE = "ef-mvp.m2.parameters.potencial-rebalse"

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
            "reason": "exceed",
            "parameter": "overflow-potential"
        }
