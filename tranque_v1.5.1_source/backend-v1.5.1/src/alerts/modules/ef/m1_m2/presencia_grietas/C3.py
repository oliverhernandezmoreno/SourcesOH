from alerts.spreads import spread_sectors
from alerts.modules.base_states import EVENT_STATES
from base.fields import StringEnum
from alerts.modules.ef.m1_m2.presencia_grietas.base import PresenciaGrietasController
from alerts.modules.utils import single_state_create


@spread_sectors()
class Controller(PresenciaGrietasController):
    states = StringEnum(*EVENT_STATES, 'C3')

    _relevant_events = ['C3']

    children = StringEnum(
        GRIETAS="_.ef.m1_m2.presencia_grietas.C1C2",
    )

    create = single_state_create("C3")
