from .base import CumplimientoDrenajeController
from alerts.modules.utils import single_state_create
from alerts.modules.base_states import EVENT_STATES
from base.fields import StringEnum


class Controller(CumplimientoDrenajeController):
    states = StringEnum(*EVENT_STATES, "A1")

    _relevant_events = ["A1"]

    create = single_state_create("A1")
