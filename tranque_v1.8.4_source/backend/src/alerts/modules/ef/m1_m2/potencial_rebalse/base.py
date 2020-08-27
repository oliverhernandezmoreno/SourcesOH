from django.db.models import Q
from django.utils.decorators import classproperty
from alerts.modules.ef.ef_event import EFEventController
from alerts.modules.event_types import CRITICAL_PARAMETERS, OVERFLOW_POTENTIAL

PROFILE_DESCRIPTIONS = {
    'A1': 'Se detecta una falla o bloqueo de los canales perimetrales, lo cual indica que existe un evento \
    que afecta su funcionamiento. Entre los principales eventos se pueden destacar deslizamiento de terreno \
    natural sobre los canales o deslizamiento o derrumbe de parte de estos, bloqueo u obstrucción de algún \
    sector del canal, entre otros.\n\n\
    Recomendación: Confirmar la ocurrencia del evento identificado a través de registros fotográficos o de la \
    medición de alguna variable de monitoreo relacionada. Registrar posibles causas que sean evidentes de \
    una inspección visual, el lugar, la extensión, y la data estimada del problema. Además, se sugiere revisar el \
    parámetro crítico Potencial de Rebalse, en caso de tener un pronóstico de lluvia o una lluvia en desarrollo \
    al mismo tiempo.',

    'A2': 'Se detecta que el potencial de rebalse es mayor a 1 empleando los datos del pronóstico de lluvia. \
    Esto indica que si el pronóstico se cumple, existe una alta probabilidad de que ocurra un rebalse durante la \
    lluvia pronosticada.\n\n\
    Recomendación: Verificar el evento descrito y revisar la interfaz del parámetro crítico Potencial de Rebalse.',

    'A3': 'Se detecta que el potencial de rebalse se encuentra entre 0,8 y 1,0. Esto indica que si el \
    pronóstico se cumple, existe una alta probabilidad de que la lluvia pronosticada ocupe la mayor parte del \
    volumen disponible del depósito, pudiendo gatillar un rebalse.\n\n\
    Recomendación: Verificar el evento descrito y revisar la interfaz del parámetro crítico Potencial de Rebalse.',

    'B1': 'Existe un pronóstico de lluvia\n\n\
    Recomendación: Confirmar la ocurrencia del pronóstico e informar al superior a cargo. Se recomienda \
    además ingresar los valores del pronóstico de lluvia en la interfaz del potencial de rebalse para su \
    evaluación.',

    'B2': 'Se detecta el inicio de lluvia en el depósito.\n\n\
    Recomendación: Confirmar la ocurrencia del evento identificado e informar al superior a cargo. Se sugiere \
    una revisión de la interfaz del Potencial de Rebalse para el ingreso de un pronóstico de lluvia asociado al \
    evento y, además el responsable del depósito por parte de la Compañía Minera debe verificar el estado del \
    escenario de falla de rebalse RE-01.',

    'B3': 'Se detecta que el tiempo de evacuación ante una emergencia es menor que el tiempo \
    pronosticado para un potencial rebalse.\n\n\
    Recomendación: Verificar el evento descrito e informar al superior a cargo. Además, el responsable del \
    depósito por parte de la Compañía Minera debe verificar el estado del escenario de falla de rebalse RE-01.',

    'B4': 'Se detecta que el potencial de rebalse es mayor que 1,0. Esto indica que en caso de cumplirse \
    el pronóstico de lluvia ingresado al sistema, existe una muy alta probabilidad de que ocurra un rebalse \
    durante la lluvia indicada.\n\n\
    Recomendación: Verificar el evento descrito e informar al superior a cargo, además el responsable del \
    depósito por parte de la Compañía Minera debe verificar el estado del escenario de falla de rebalse RE-01.',
}


class PotencialRebalseController(EFEventController):
    name = "Potencial de Rebalse"

    event_type = CRITICAL_PARAMETERS

    visibility_groups = (
        "ef",
        "m1",
        "ef.m1_m2",
        "ef.m1_m2.potencial_rebalse",
        "mine",
        "authority"
    )

    TEMPLATE = "ef-mvp.m2.parameters.potencial-rebalse"

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
            "event_type": self.event_type,
            "parameter": OVERFLOW_POTENTIAL
        }
