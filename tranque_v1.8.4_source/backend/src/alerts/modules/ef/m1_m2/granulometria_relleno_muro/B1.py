from alerts.modules import base
from alerts.modules.ef.m1_m2.granulometria_relleno_muro.base import GranulometriaRellenoMuroController
from alerts.modules.utils import single_state_create
from alerts.modules.base_states import EVENT_STATES
from alerts.modules.event_types import DAILY_INSPECTION


class Controller(GranulometriaRellenoMuroController):
    name = "Materiales apropiados"

    event_type = DAILY_INSPECTION

    states = base.StringEnum(*EVENT_STATES, "B1")

    _relevant_events = ["B1"]

    create = single_state_create("B1")
