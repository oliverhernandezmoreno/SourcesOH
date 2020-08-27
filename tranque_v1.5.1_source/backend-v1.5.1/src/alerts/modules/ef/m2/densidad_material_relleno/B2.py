from alerts.spreads import spread_sectors
from alerts.modules.ef.m2.densidad_material_relleno.base import DensidadMaterialRellenoController
from alerts.modules.utils import single_state_create
from alerts.modules.base_states import EVENT_STATES
from base.fields import StringEnum


@spread_sectors()
class Controller(DensidadMaterialRellenoController):
    states = StringEnum(*EVENT_STATES, 'B2')

    _relevant_events = ['B2']

    create = single_state_create("B2")
