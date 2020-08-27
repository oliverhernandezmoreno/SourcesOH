from django.db.models import Q
from django.utils.decorators import classproperty
from alerts.modules.ef.ef_event import EFEventController

PROFILE_DESCRIPTIONS = {
    'A1': 'Si el instrumento vuelve a enviar información, a la frecuencia \
    preestablecida, ésta no será considerada para el cálculo del IEF hasta \
    que se verifique la causa de la pérdida de comunicación con el instrumento. ',
    'A2': 'Los datos serán considerados para el cálculo del IEF, pero \
    el evento seguirá activo hasta que se verifique la causa de la información \
    repetida. ',
    'A3': 'Los datos no serán considerados para el cálculo del \
    IEF y el evento seguirá activo hasta que se verifique la causa de \
    la información anómala. ',
}


class ProblemasInstrumentacionController(EFEventController):
    name = "Eventos asociados a problemas de instrumentación en línea. "

    visibility_groups = (
        "ef",
        "m2",
        "ef.m2",
        "ef.m2.escenarios_falla",
        "ef.m2.escenarios_falla.eventos_problemas_instrumentacion",
        "mine",
    )

    @classproperty
    def relevant_events(cls):
        group = cls.spread_object()
        return [
            cls.event_query(Q(canonical_name='.'.join([
                group.target.canonical_name,
                f's-{group.hardware_id}',
                'ef-mvp.m2.failure_scenarios.fi-01',
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
            "parameter": "failure_scenarios"
        }
