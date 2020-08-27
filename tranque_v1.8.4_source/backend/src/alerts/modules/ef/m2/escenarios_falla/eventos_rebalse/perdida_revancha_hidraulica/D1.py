from base.fields import StringEnum
from .base import RebalseRevanchaController
from alerts.modules.base_states import EVENT_STATES
from alerts.modules.utils import single_state_create


class Controller(RebalseRevanchaController):
    states = StringEnum(*EVENT_STATES, 'D1')

    _relevant_events = ["D1"]

    create = single_state_create("D1")
