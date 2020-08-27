from alerts.modules import base
from .base import GranulometriaRellenoMuroController
from alerts.modules.base_states import EVENT_STATES
from alerts.modules.utils import single_state_create


class Controller(GranulometriaRellenoMuroController):
    states = base.StringEnum(*EVENT_STATES, "A1")

    _relevant_events = ["A1"]

    create = single_state_create("A1")
