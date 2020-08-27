from django.db.models import Q
from django.utils.decorators import classproperty

from alerts.modules.ef.m2.base import M2BaseController

PROFILE_DESCRIPTIONS = {
    'B1': 'Se mide una tendencia desfavorable para intersección con el primer umbral',
    'B2': 'Se mide una tendencia desfavorable para intersección con el segundo umbral',
    'B3': 'Cambio de tendencia posterior a evento sísmico',
    'B4-1': 'Si un instrumento supera el primer umbral',
    'B4-2': 'Si un instrumento supera el segundo umbral',
    'B5-1': 'Si un instrumento supera el primer umbral y en el mismo sector, '
            'pero distinta ubicación supera el primer umbral',
    'B5-2': 'Si un instrumento supera el segundo umbral y un instrumento en el mismo sector, '
            'pero en una ubicación distinta supera el primer umbral',
    'B5-3': 'Si dos instrumentos validables entre si superan el primer umbral',
    'B5-4': 'Si un instrumento supera el segundo umbral y un instrumento en el mismo sector, '
            'pero en una ubicación distinta supera el segundo umbral',
    'B6-1': 'Si un instrumento que superó el primer umbral es validado manualmente',
    'B6-2': 'Si dos instrumentos validables entre si superan el primer umbral y uno de ellos es validado manualmente',
    'B6-3': 'Si dos instrumentos validables entre si superan el primer umbral y ambos son validados manualmente',
    'C1-1': 'Si un instrumento supera el segundo umbral y un instrumento con el que es validable '
            'supera el primer umbral',
    'C1-2': 'Si dos instrumentos, validables entre sí superan el primer umbral '
            'y un instrumento en el mismo sector, pero en distinta ubicación supera el primer umbral.',
    'C1-3': 'Si dos instrumentos, validables entre sí superan el primer umbral '
            'y un instrumento en el mismo sector, pero en distinta ubicación supera el segundo umbral.',
    'C1-4': 'Si dos instrumentos, validables entre sí superan el primer umbral '
            'y dos instrumentos en el mismo sector, pero en distinta ubicación superan el primer umbral.',
    'C1-5': 'Si dos instrumentos, validables entre sí superan el primer umbral '
            'y un instrumento en el mismo sector, pero en distinta ubicación supera el segundo umbral '
            'y su validador supera el primer umbral.',
    'C1-6': 'Si de dos instrumentos, validables entre sí uno supera el primer umbral '
            'y el otro supera el segundo umbral y al mismo tiempo un instrumento en el mismo sector, '
            'pero en distinta ubicación supera el segundo umbral y su validador supera el primer umbral',
    'C2-1': 'Si un instrumento validado manualmente supera el primer umbral '
            'y al menos un instrumento en el mismo sector, pero en distinta ubicación supera el primer '
            '(independiente si es validado manualmente de forma posterior) o segundo umbral.',
    'C2-2': 'Si de dos instrumentos validables entre sí, uno supera el primer umbral es validado manualmente '
            'y el otro supera el segundo umbral',
    'D1': 'Si dos instrumentos validables entre si superan el segundo umbral',
    'D2': 'Si un instrumento validado manualmente supera el segundo umbral',
}


class PresionPorosController(M2BaseController):
    name = "Cambio en Presión de Poros"

    visibility_groups = (
        *M2BaseController.visibility_groups,
        "ef.m2.presion_poros",
    )

    _relevant_events = []

    @classproperty
    def relevant_events(cls):
        obj = cls.spread_object()
        base = f'{obj.target.canonical_name}.s-{obj.hardware_id}.ef-mvp.m2.parameters.presion-poros.'
        return [
            # retrieve last event of every event
            cls.event_query(Q(canonical_name__startswith=f'{base}{suffix}'), 1)
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
            "parameter": "porePressure"
        }
