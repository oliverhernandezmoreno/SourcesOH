from alerts.spreads import spread_sectors
from .base import ModulosDeformacionController
from alerts.modules.utils import single_state_create
from alerts.modules.base_states import EVENT_STATES
from base.fields import StringEnum


@spread_sectors()
class Controller(ModulosDeformacionController):
    states = StringEnum(*EVENT_STATES, "C1")

    _relevant_events = ["C1"]

    children = ["*.ef.m2.modulos_deformacion_resistencia_corte.B1"]

    create = single_state_create("C1")
