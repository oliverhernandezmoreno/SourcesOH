from django.db.models import Q
from django.utils.decorators import classproperty
from alerts.modules.ef.ef_event import EFEventController
from alerts.modules.event_types import CRITICAL_PARAMETERS, TURBIDIMETER

PROFILE_DESCRIPTIONS = {
    'B1': 'Se detecta material particulado a la salida del sistema de drenaje.',
    'B2': 'Medida de turbidez > Valor umbral.',
    'B3': 'Se activan simultáneamente los eventos asociados a los Eventos B1 Y B2.',
    'C1': 'El Evento B3 se mantiene activo por un tiempo mayor a “α”.',
}


class TurbiedadSistemaDrenajeController(EFEventController):
    name = "Turbiedad del Agua en el Sistema de Drenaje"

    event_type = CRITICAL_PARAMETERS

    visibility_groups = (
        "ef",
        "m1",
        "ef.m1_m2",
        "ef.m1_m2.turbiedad_sistema_drenaje",
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
                'ef-mvp.m2.parameters.turbiedad',
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
            "parameter": TURBIDIMETER
        }
