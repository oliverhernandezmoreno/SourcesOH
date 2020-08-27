from django.db.models import Q
from django.utils.decorators import classproperty
from alerts.modules.ef.ef_event import EFEventController

PROFILE_DESCRIPTIONS = {
    'A1': 'No se realizó la validación de la información asociada a la \
    caracterización geotécnica del suelo de fundación.',
    'A2': 'Se dispone de información parcial de la caracterización geotécnica \
    del suelo de fundación.',
    'B1': 'No se tiene información asociada a la caracterización geotécnica \
    del suelo de fundación.',
}


class EvaluacionGeotecnicaController(EFEventController):
    name = "Evaluación de la adecuada caracterización geotécnica del suelo de fundación"

    visibility_groups = (
        "ef",
        "m1",
        "ef.m2",
        "ef.m2.evaluacion_geotecnica_suelo",
        "mine",
        "authority"
    )

    TEMPLATE = "ef-mvp.m2.parameters.discrete.modulo-deformacion-suelo"

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
