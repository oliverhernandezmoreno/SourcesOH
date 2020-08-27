from django.db.models import Q
from django.utils.decorators import classproperty
from alerts.modules.ef.ef_event import EFEventController

PROFILE_DESCRIPTIONS = {
    'A1': 'No se han actualizado los estudios de las revanchas \
    mínimas (operacional y/o hidráulica).',
    'B1': 'No existe estudio de revanchas mínimas.',
}


class RevanchaMinimaController(EFEventController):
    name = "Revancha mínima"

    visibility_groups = (
        "ef",
        "m1",
        "ef.m2",
        "ef.m2.revancha_minima",
        "mine",
    )

    TEMPLATE = "ef-mvp.m2.parameters.discrete.revancha-minima"

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
