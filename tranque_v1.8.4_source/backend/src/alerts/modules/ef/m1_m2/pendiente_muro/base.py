from django.db.models import Q
from django.utils.decorators import classproperty
from targets.models import DataSource
from alerts.modules.event_types import CRITICAL_PARAMETERS, TOPOGRAPHY
from alerts.modules.ef.ef_event import EFEventController


PROFILE_DESCRIPTIONS = {
    'A2': 'Valor pendiente local entre 2 puntos (Aguas abajo) ≤ Valor Umbral (Aguas abajo)',
    'A3': 'Valor pendiente local entre 2 puntos (Aguas arriba) ≤ Valor Umbral (Aguas arriba)',
    'B1': 'Valor pendiente (Aguas abajo) ≤ Valor Umbral + Valor Umbral (Aguas abajo) ∙ α1 (%)',
    'B2': 'Valor pendiente (Aguas arriba) ≤ Valor Umbral + Valor Umbral (Aguas arriba) ∙ α2 (%)',
    'B3': 'Valor pendiente (Aguas abajo) ≤ Valor Umbral (Aguas abajo',
    'B4': 'Valor pendiente (Aguas arriba) ≤ Valor Umbral (Aguas arriba)',
}

PROFILE_EVENTS = PROFILE_DESCRIPTIONS.keys()


class PendienteMuroController(EFEventController):
    name = "Cambios en pendiente de muro"

    event_type = CRITICAL_PARAMETERS

    visibility_groups = (
        "ef",
        "m1",
        "ef.m1_m2",
        "ef.m1_m2.pendiente_muro",
        "mine",
        "authority"
    )

    @classproperty
    def relevant_events(cls):
        group = cls.spread_object()
        sources = DataSource.objects.filter(groups=group).filter(groups__canonical_name="perfil-transversal")
        return [
            cls.event_query(Q(canonical_name='.'.join([
                group.target.canonical_name,
                f's-{source.hardware_id}',
                'ef-mvp.m2.parameters.pendiente-muro.sector',
                suffix
            ])), 1)
            for suffix in cls._relevant_events
            for source in sources
        ]

    def result_state(self, ticket):
        if ticket.state == self.CLOSED_STATE:
            return {'level': 0, 'short_message': self.name}
        return {
            'level': self.get_level(ticket),
            'short_message': self.name,
            'message': PROFILE_DESCRIPTIONS.get(ticket.state, ''),
            "event_type": self.event_type,
            "parameter": TOPOGRAPHY
        }
