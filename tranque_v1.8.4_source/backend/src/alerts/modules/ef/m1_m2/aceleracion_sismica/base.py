from django.db.models import Q
from django.utils.decorators import classproperty
from alerts.modules.ef.ef_event import EFEventController
from alerts.modules.event_types import CRITICAL_PARAMETERS, EARTHQUAKE

PROFILE_DESCRIPTIONS = {
    'A1': 'Evidencia de un sismo menor, que fue detectado \
    pero que no generó un movimiento lo suficientemente fuerte como \
    para que el operador perdiera su estabilidad y no pudiese mantenerse \
    en pie.',
    'D1': 'Máxima aceleración medida en roca < Primer valor umbral.',
    'D2': 'Máxima aceleración medida en el suelo de fundación < Segundo valor umbral.',
    'D3': 'Máxima aceleración medida en el coronamiento del muro < Tercer valor umbral.'
}


class AceleracionSismicaController(EFEventController):
    name = "Aceleración sísmica del muro"

    event_type = CRITICAL_PARAMETERS

    visibility_groups = (
        "ef",
        "m1",
        "ef.m1_m2",
        "ef.m1_m2.aceleracion_sismica",
        "mine",
        "authority"
    )

    @classproperty
    def relevant_events(cls):
        group = cls.spread_object()
        return [
            cls.event_query(Q(canonical_name='.'.join([
                group.target.canonical_name,
                f's-{group.hardware_id}',
                'ef-mvp.m2.parameters.aceleracion-sismica',
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
            "event_type": self.event_type,
            "parameter": EARTHQUAKE
        }
