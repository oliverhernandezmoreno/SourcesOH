from django.db.models import Q
from base.fields import StringEnum
from django.utils.decorators import classproperty
from alerts.modules.ef.ef_event import EFEventController
from alerts.modules.base_states import EVENT_STATES
from alerts.modules.utils import single_state_create
from alerts.modules.event_types import FAILURE_SCENARIO

PROFILE_DESCRIPTIONS = {
    'D2': 'Se detecta que un sector ubicado en el terreno natural presenta altas \
    probabilidades de generar un deslizamiento hacia el interior de la cubeta, \
    combinado con una revancha hidráulica cercana al umbral.\n\n\
    Recomendación: Detener todas las actividades operacionales y ejecutar el plan \
    de evacuación. Además, activar una revisión remota (por ejemplo, vuelos de dron, \
    cámaras y aumentar frecuencia de monitoreo de todas las variables automáticas) \
    y planificar visitas de inspección una vez conocidos y controlados los riesgos \
    identificados en la revisión. Finalmente, el responsable del depósito por parte \
    de la Compañía Minera debe considerar las gestiones necesarias dado que este \
    evento está asociado a una Alerta Roja.',
}


class Controller(EFEventController):
    name = "Rebalse por ola debido a deslizamiento. "

    event_type = FAILURE_SCENARIO

    states = StringEnum(*EVENT_STATES, 'D2')

    visibility_groups = (
        "ef",
        "m2",
        "ef.m2",
        "ef.m2.escenarios_falla",
        "ef.m2.escenarios_falla.eventos_rebalse",
        "ef.m2.escenarios_falla.eventos_rebalse.ola_deslizamiento",
        "mine",
        "authority"
    )

    TEMPLATE = 'ef-mvp.m2.failure_scenarios.re-02'

    _relevant_events = ["D2"]

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
            return self.no_result_state
        return {
            'level': self.get_level(ticket),
            'short_message': '',
            'message': PROFILE_DESCRIPTIONS.get(ticket.state, ''),
            'event_type': self.event_type,
            "parameter": self.name
        }

    create = single_state_create("D2")
