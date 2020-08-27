from alerts.spreads import spread_sectors
from alerts.modules import base
from .base import GranulometriaRellenoMuroController
from alerts.modules.base_states import EVENT_STATES
from alerts.modules.utils import single_state_create


@spread_sectors()
class Controller(GranulometriaRellenoMuroController):
    states = base.StringEnum(*EVENT_STATES, "B2")

    _relevant_events = ["B2"]

    create = single_state_create("B2")
