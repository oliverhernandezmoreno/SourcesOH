from django.db.models import Q
from django.utils.decorators import classproperty
from alerts.modules.event_types import CRITICAL_PARAMETERS, PORE_PRESSURE
from alerts.modules.ef.m2.base import M2BaseController
from alerts.modules.base import spread
from targets.models import DataSource

EVENT_DESCRIPTIONS = {
    'A1': 'Se detecta la presencia de nivel freático asociado a un piezómetro de un sector dentro de la \
    cubeta del depósito.\n\n\
    Recomendación: Verificar el evento descrito.',

    'B1': 'Se detecta que el nivel freático de la cubeta del depósito evaluada en un sector supera el valor \
    umbral definido.\n\n\
    Recomendación: Verificar el evento descrito e informar al superior a cargo, además el responsable del \
    depósito por parte de la Compañía Minera debe verificar el estado del escenario de falla de rebalse RE-03.',
}

EVENTS_STATES = EVENT_DESCRIPTIONS.keys()


@spread(DataSource, Q(groups__canonical_name='piezometros'))
class Controller(M2BaseController):
    name = "Nivel freático de la cubeta del depósito"

    visibility_groups = (
        *M2BaseController.visibility_groups,
        "ef.m2.nivel_freatico_cubeta_deposito",
    )

    states = [*EVENTS_STATES, 'C', 'D']

    @classproperty
    def relevant_events(cls):
        obj = cls.spread_object()
        return [
            cls.event_query(Q(canonical_name='.'.join([
                obj.target.canonical_name,
                f's-{obj.hardware_id}',
                'ef-mvp.m2.parameters.nivel-freatico-cubeta-deposito',
                suffix
            ])), 1)
            for suffix in EVENTS_STATES
        ]

    def result_state(self, ticket):
        if ticket.state == self.CLOSED_STATE:
            return {'level': 0, 'short_message': self.name}
        return {
            'level': self.get_level(ticket),
            'short_message': f'{self.name} [{self.spread_object().name}]',
            'message': EVENT_DESCRIPTIONS.get(ticket.state, ''),
            "event_type": CRITICAL_PARAMETERS,
            "parameter": PORE_PRESSURE
        }
