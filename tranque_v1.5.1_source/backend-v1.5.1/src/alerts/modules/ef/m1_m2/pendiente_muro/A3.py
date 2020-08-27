from alerts.spreads import spread_sectors
from .base import PendienteMuroController
from alerts.modules.utils import single_state_create
from alerts.modules.base_states import EVENT_STATES
from base.fields import StringEnum


@spread_sectors()
class Controller(PendienteMuroController):
    states = StringEnum(*EVENT_STATES, 'A3')

    _relevant_events = ['A3']

    create = single_state_create("A3")
