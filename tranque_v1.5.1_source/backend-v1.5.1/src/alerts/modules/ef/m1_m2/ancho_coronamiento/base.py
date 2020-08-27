from django.db.models import Q
from django.utils.decorators import classproperty
from alerts.modules.ef.ef_event import EFEventController

PROFILE_DESCRIPTIONS = {
    'A1': 'Existen sectores donde el ancho de coronamiento presenta valores cercanos al\
           mínimo establecido o existe deslizamiento de talud.',
    'A2': 'Valor medido <= Valor umbral + Valor Umbral∙α',
    'B1': 'Valor medido <= Valor Umbral',
    'B2': 'El “Evento B1” se mantuvo activo durante 3 meses o más.'
}


class AnchoCoronamientoController(EFEventController):
    name = "Cambio en ancho de coronamiento"

    visibility_groups = (
        "ef",
        "m1",
        "ef.m1_m2",
        "ef.m1_m2.ancho_coronamiento",
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
                'ef-mvp.m2.parameters.ancho-coronamiento.sector',
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
