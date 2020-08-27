from django.db.models import Q
from django.utils.decorators import classproperty
from alerts.modules.ef.ef_event import EFEventController

PROFILE_DESCRIPTIONS = {
    'A1': 'Corresponde a cualquier problema en el vertedero de emergencia que tenga \
            como consecuencia que este no se encuentre completamente operativo, \
            en caso de ser necesario su uso.',
    'A2': 'Ha ocurrido una modificación en la cota de funcionamiento del vertedero.',
}


class VertederoEmergenciaController(EFEventController):

    visibility_groups = (
        "ef",
        "m1",
        "ef.m1_m2",
        "ef.m1_m2.vertedero_emergencia",
        "mine",
        "authority",
    )

    @classproperty
    def relevant_events(cls):
        return [cls.event_query(Q(template_name=cls.TEMPLATE), 1)]

    def result_state(self, ticket):
        if ticket.state == self.CLOSED_STATE:
            return {'level': 0, 'short_message': self.name}
        return {
            'level': self.get_level(ticket),
            'short_message': self.name,
            'message': PROFILE_DESCRIPTIONS.get(ticket.state, ''),
            "reason": "instrument-fail",
            "parameter": "emergency-dump"
        }
