from alerts.modules.ef.m1_m2.potencial_rebalse.base import PotencialRebalseController
from alerts.modules.utils import single_state_create
from alerts.modules.base_states import EVENT_STATES
from base.fields import StringEnum


class Controller(PotencialRebalseController):
    states = StringEnum(*EVENT_STATES, "A2")

    _relevant_events = ['A2']

    create = single_state_create("A2")
