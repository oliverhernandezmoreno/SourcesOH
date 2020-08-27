from django.db.models import Q
from django.utils.decorators import classproperty
from alerts.modules.ef.ef_event import EFEventController

PROFILE_DESCRIPTIONS = {
    'B1': 'Se detecta una falla en el sistema de drenaje.',
    'B2': 'Se detecta una variación brusca de caudal.',
    'B3': 'Presión de poro medida > Valor umbral (asociado a la altura del dren)',
    'C1-1': 'Dos instrumentos validables entre si deben superar el valor umbral de “Evento B3“.',
    'C1-2': 'Validación manual de un instrumento en Evento “B3“.'
}


class IntegridadSistemaDrenajeController(EFEventController):
    name = "Integridad del Sistema de Drenaje"

    visibility_groups = (
        "ef",
        "m1",
        "ef.m1_m2",
        "ef.m1_m2.integridad_sistema_drenaje",
        "mine",
        "authority"
    )

    @classproperty
    def relevant_events(cls):
        source = cls.spread_object()
        return [
            cls.event_query(Q(canonical_name='.'.join([
                source.target.canonical_name,
                f's-{source.hardware_id}',
                'ef-mvp.m2.parameters.integridad-sistema-drenaje',
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
            "parameter": "flowmeter"
        }
