from django.db.models import Q
from django.utils.decorators import classproperty
from alerts.modules.ef.ef_event import EFEventController
from alerts.modules.event_types import CRITICAL_PARAMETERS, GRANULOMETRY

PROFILE_DESCRIPTIONS = {
    'B1': 'Densidad medida < Primer valor umbral. ',
    'B2': 'Nivel de compactación < Segundo valor umbral. ',
}


class DensidadMaterialRellenoController(EFEventController):
    name = "Densidad del material de relleno del muro."

    visibility_groups = (
        "ef",
        "m1",
        "ef.m2",
        "ef.m2.densidad_material_relleno",
        "mine",
    )

    @classproperty
    def relevant_events(cls):
        group = cls.spread_object()
        return [
            cls.event_query(Q(canonical_name='.'.join([
                group.target.canonical_name,
                f'g-{group.canonical_name}',
                'ef-mvp.m2.parameters.densidad',
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
            "parameter": GRANULOMETRY
        }
