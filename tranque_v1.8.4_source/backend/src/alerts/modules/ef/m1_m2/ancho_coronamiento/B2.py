from alerts.spreads import spread_sectors
from alerts.modules.ef.m1_m2.ancho_coronamiento.base import AnchoCoronamientoController
from alerts.modules.utils import single_state_create
from alerts.modules.base_states import EVENT_STATES
from base.fields import StringEnum


@spread_sectors()
class Controller(AnchoCoronamientoController):
    states = StringEnum(*EVENT_STATES, 'B2')

    _relevant_events = ['B2']

    children = ['*.ef.m1_m2.ancho_coronamiento.AB']

    create = single_state_create("B2")
