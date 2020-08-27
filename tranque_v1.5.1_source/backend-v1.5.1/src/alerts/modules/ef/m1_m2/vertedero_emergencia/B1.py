from alerts.modules import base
from alerts.modules.ef.m1_m2.vertedero_emergencia.base import VertederoEmergenciaController
from alerts.modules.utils import single_state_create
from alerts.modules.base_states import EVENT_STATES
from base.fields import StringEnum


class Controller(VertederoEmergenciaController):
    name = "Estado operativo del vertedero de emergencia"

    states = StringEnum(*EVENT_STATES, "B1")

    children = base.StringEnum(
        VERTEDERO_EMERGENCIA='_.ef.m1_m2.vertedero_emergencia.A1',
        PRONOSTICO_LLUVIA='_.ef.m1_m2.potencial_rebalse.B1',
        LLUVIA='_.ef.m1_m2.potencial_rebalse.B2'
    )

    TEMPLATE = "ef-mvp.m2.parameters.estado-vertedero.B1"

    def result_state(self, ticket):
        if ticket.state == self.CLOSED_STATE:
            return {'level': 0, 'short_message': self.name}
        return {
            'level': self.get_level(ticket),
            'short_message': self.name,
            'message': self.name,
            "reason": "combine",
            "parameter": "emergency-dump"
        }

    create = single_state_create("B1")
