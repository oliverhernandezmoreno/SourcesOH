from django.db.models import Q
from django.utils.decorators import classproperty
from alerts.modules.ef.ef_event import EFEventController
from alerts.modules.event_types import CRITICAL_PARAMETERS, DOCUMENTS

PROFILE_DESCRIPTIONS = {
    'A1': 'Se detecta que no se ha validado la información asociada a la \
    caracterización geotécnica del suelo de fundación.\n\n\
    Recomendación: Revisar y verificar el diseño del depósito.',

    'A2': 'Se detecta que se dispone de información parcial de la caracterización \
    geotécnica del suelo de fundación.\n\n\
    Recomendación: Revisar y verificar el diseño del depósito.',

    'B1': 'Se detecta que no se tiene información sobre la caracterización \
    geotécnica del suelo de fundación.\n\n\
    Recomendación: Informar al superior a cargo e ingresar a la plataforma \
    la información requerida sobre la caracterización geotécnica del suelo \
    de fundación.',
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

    TEMPLATE = "ef-mvp.m2.parameters.evaluacion-adecuada-caracterizacion-geotc"

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
            "event_type": CRITICAL_PARAMETERS,
            "parameter": DOCUMENTS
        }
