from alerts.modules.ef.m1_m2.vertedero_emergencia.base import VertederoEmergenciaController
from alerts.modules.utils import single_state_create
from alerts.modules.base_states import EVENT_STATES
from alerts.modules.event_types import DAILY_INSPECTION
from base.fields import StringEnum


class Controller(VertederoEmergenciaController):
    name = "Modificación de cota de operación del vertedero de emergencia"

    event_type = DAILY_INSPECTION

    states = StringEnum(*EVENT_STATES, "A2")

    TEMPLATE = "ef-mvp.m1.triggers.cota-vertedero"

    create = single_state_create("A2")
