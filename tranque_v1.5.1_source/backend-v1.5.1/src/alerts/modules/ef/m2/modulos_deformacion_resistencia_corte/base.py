from django.db.models import Q
from django.utils.decorators import classproperty
from alerts.modules.ef.ef_event import EFEventController

PROFILE_DESCRIPTIONS = {
    'B1': 'Ingeniero especialista (por ejemplo, EoR) detecta que las \
    propiedades resistentes o el módulo de deformación no son acorde \
    con lo especificado en el diseño (se determina a partir del informe de la\
    empresa a cargo del estudio).',
    'B2': 'Posterior a un ensayo SPT o similar realizado en el muro del \
    depósito se determina la existencia de un estrato que no cumple con \
    los criterios de densidad especificados por diseño.',
    'C1': 'En caso de mantenerse activo por un tiempo “α” el Evento B1 \
    se activa automáticamente.',
    'C2': 'Se determina que los resultados del ensayo que activo un Evento \
    B2 ponen en peligro la estabilidad del depósito debido a las \
    dimensiones del área afectada.',
    'D1': 'Se determina que el sector que no cumple con los parámetros \
    de densidad (Evento C2) se encuentra bajo el nivel freático o con \
    un nivel alto de saturación.',
}


class ModulosDeformacionController(EFEventController):
    name = "Módulos de deformación y resistencia al corte del material \
    de relleno del muro del depósito. "

    visibility_groups = (
        "ef",
        "m1",
        "ef.m2",
        "ef.m2.modulos_deformacion_resistencia_corte",
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
                'ef-mvp.m2.parameters.discrete.resistencia-corte-muro',
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
            "parameter": "PCIE_escalation"
        }
