from alerts.spreads import spread_sectors
from base.fields import StringEnum
from .base import LicuacionEstaticaController
from alerts.modules.base_states import EVENT_STATES
from alerts.modules.utils import single_state_create


@spread_sectors()
class Controller(LicuacionEstaticaController):
    states = StringEnum(*EVENT_STATES, 'C1')

    _relevant_events = ["C1"]

    create = single_state_create("C1")
