from alerts.spreads import spread_instruments
from .base import ProblemasInstrumentacionController
from alerts.modules.utils import single_state_create
from alerts.modules.base_states import EVENT_STATES
from base.fields import StringEnum


@spread_instruments()
class Controller(ProblemasInstrumentacionController):
    states = StringEnum(*EVENT_STATES, 'A3')

    _relevant_events = ['A3']

    create = single_state_create("A3")
