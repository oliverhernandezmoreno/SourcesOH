from django.db.models import Q
from django.utils.decorators import classproperty
from alerts.modules.ef.ef_event import EFEventController

PROFILE_DESCRIPTIONS = {
    'A1': 'No se ha realizado la validación de la información asociada al \
    cumplimiento de las características de diseño del sistema de drenaje.',
    'A2': 'Se dispone de información parcial del cumplimiento de las \
    características de diseño del sistema de drenaje.',
    'B1': 'No se tiene información asociada al cumplimiento de las \
    características de diseño del sistema de drenaje.',
}


class CumplimientoDrenajeController(EFEventController):
    name = "Cumplimiento de las características de diseño del sistema de drenaje"

    visibility_groups = (
        "ef",
        "m1",
        "ef.m2",
        "ef.m2.cumplimiento_sistema_drenaje",
        "mine",
        "authority"
    )

    TEMPLATE = "ef-mvp.m2.parameters.discrete.cumplimiento-diseno-dren"

    @classproperty
    def relevant_events(cls):
        return [
            cls.event_query(Q(template_name='.'.join([
                cls.TEMPLATE,
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
