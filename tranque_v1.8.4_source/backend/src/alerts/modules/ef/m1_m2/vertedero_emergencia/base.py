from django.db.models import Q
from django.utils.decorators import classproperty
from alerts.modules.ef.ef_event import EFEventController
from alerts.modules.event_types import CRITICAL_PARAMETERS, DUMP

PROFILE_DESCRIPTIONS = {
    'A1': 'Se detecta una falla o bloqueo del vertedero de emergencia que tenga como consecuencia que \
    éste no se encuentre completamente operativo, en caso de ser necesario su uso.\n\n\
    Recomendación: Confirmar la ocurrencia del evento identificado a través de registros fotográficos o de la \
    medición de alguna variable de monitoreo relacionada. Registrar posibles causas que sean evidentes a \
    partir de una inspección visual, el lugar, la extensión y la data estimada del problema. Además, se sugiere \
    revisar el parámetro crítico Potencial de Rebalse, en caso de tener un pronóstico de lluvia o una lluvia en \
    desarrollo al mismo tiempo.',

    'A2': 'Se detecta una modificación de la cota de operación del vertedero de emergencia (definida por \
    la ubicación del vertedero, la etapa de crecimiento del muro o la cantidad de losetas instalada en la \
    estructura entre otros) por cualquier tipo de motivo.\n\n\
    Recomendación: Confirmar la ocurrencia del evento identificado a través de registros fotográficos o de la \
    medición de alguna variable de monitoreo relacionada. Registrar posibles causas que sean evidentes de \
    una inspección visual, el lugar, la extensión y la data estimada del problema. Además, se sugiere revisar el \
    parámetro crítico Potencial de Rebalse, en caso de tener un pronóstico de lluvia o una lluvia en desarrollo \
    al mismo tiempo.',

    'B1': 'Se detecta que el vertedero de emergencia no está operativo y que además existe una lluvia en \
    desarrollo o pronóstico de lluvia.\n\n\
    Recomendación: Verificar el evento descrito e informar al superior a cargo.'
}


class VertederoEmergenciaController(EFEventController):
    name = 'Estado operativo del vertedero de emergencia'

    event_type = CRITICAL_PARAMETERS

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
            "event_type": self.event_type,
            "parameter": DUMP
        }
