from django.db.models import Q
from django.utils.decorators import classproperty
from alerts.modules.ef.ef_event import EFEventController
from alerts.modules.event_types import CRITICAL_PARAMETERS, DOCUMENTS

PROFILE_DESCRIPTIONS = {
    'A1': 'Se ha detectado que los documentos de respaldo de los cálculos de \
    revancha mínima no se encuentran actualizados.\n\n\
    Recomendación: Actualizar el estudio de las revanchas mínimas y tomar las \
    acciones necesarias en caso de modificar los valores definidos actualmente.',
    'B1': 'Se ha detectado que no existe un estudio de respaldo de revanchas \
    mínimas ingresado al sistema.\n\n\
    Recomendación: Cargar al sistema el estudio de revanchas mínimas y en caso \
    de no existir, generar el estudio e informar al superior a cargo para verificar \
    qué medidas se deben tomar.',
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

    TEMPLATE = "ef-mvp.m2.parameters.revancha-minima"

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
