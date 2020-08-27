from alerts.modules import base
from .base import RemocionTerrenoController
from alerts.modules.base_states import EVENT_STATES
from alerts.modules.utils import single_state_create


class Controller(RemocionTerrenoController):
    states = base.StringEnum(*EVENT_STATES, 'D1')

    _relevant_events = ['D1']

    create = single_state_create("D1")
