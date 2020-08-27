from .base import EvaluacionGeotecnicaController
from alerts.modules.utils import single_state_create
from alerts.modules.base_states import EVENT_STATES
from base.fields import StringEnum


class Controller(EvaluacionGeotecnicaController):
    states = StringEnum(*EVENT_STATES, "B1")

    _relevant_events = ["B1"]

    create = single_state_create("B1")
