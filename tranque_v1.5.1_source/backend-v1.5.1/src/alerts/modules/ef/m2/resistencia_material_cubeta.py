from django.db.models import Q
from alerts.spreads import spread_sectors
from django.utils.decorators import classproperty
from alerts.modules.utils import single_state_create
from alerts.modules.ef.ef_event import EFEventController
from alerts.modules.base_states import EVENT_STATES
from base.fields import StringEnum


@spread_sectors()
class Controller(EFEventController):
    name = "Resistencia del material de relaves de la cubeta del muro"

    states = StringEnum(*EVENT_STATES, 'B1')

    visibility_groups = (
        'ef',
        'ef.m2',
        'ef.m2.resistencia_material_cubeta',
        'mine',
        'authority',
    )

    @classproperty
    def relevant_events(cls):
        group = cls.spread_object()
        return [
            cls.event_query(Q(canonical_name='.'.join([
                group.target.canonical_name,
                f'g-{group.canonical_name}',
                'ef-mvp.m2.parameters.discrete.resistencia-material'
            ])), 1)
        ]

    def result_state(self, ticket):
        if ticket.state == self.CLOSED_STATE:
            return {'level': 0, 'short_message': self.name}
        return {
            'level': self.get_level(ticket),
            'short_message': self.name,
            'message': 'Se detecta que las propiedades resistentes de la \
                        cubeta no cumplen con las especificadas en diseño \
                        (Se determina a partir del informe de la empresa a \
                        cargo del estudio).',
            "reason": "exceed",
            "parameter": "documents"
        }

    create = single_state_create("B1")
