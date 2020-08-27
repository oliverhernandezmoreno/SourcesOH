from django.db.models import Q
from django.utils.decorators import classproperty
from targets.models import DataSource
from alerts.modules.event_types import CRITICAL_PARAMETERS, TOPOGRAPHY
from alerts.modules.ef.ef_event import EFEventController

PROFILE_DESCRIPTIONS = {
    'A1': 'Se activa el evento asociado a la desviación del diseño \
            Revancha operacional e hidráulica"',
    'A2': 'Revancha operacional ≤ Tercer valor Umbral',
    'B1': 'Revancha operacional ≤ Primer valor Umbral + Primer valor Umbral ∙ α1 (%)',
    'B2': 'Revancha operacional ≥ Segundo valor Umbral - Segundo valor Umbral ∙ α2 (%)',
    'B3': 'Revancha operacional ≤ Primer valor Umbral',
    'C1': 'Revancha operacional ≥ Segundo valor Umbral',
}

PROFILE_EVENTS = PROFILE_DESCRIPTIONS.keys()


class RevanchaOperacionalController(EFEventController):
    name = "Cambio en Revancha Operacional"

    event_type = CRITICAL_PARAMETERS

    visibility_groups = (
        "ef",
        "m1",
        "ef.m1_m2",
        "ef.m1_m2.revancha_operacional",
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
                'ef-mvp.m2.parameters.revancha-operacional',
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
