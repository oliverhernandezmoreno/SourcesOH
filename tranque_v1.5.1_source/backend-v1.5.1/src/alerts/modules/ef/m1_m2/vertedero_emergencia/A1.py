from alerts.modules.ef.m1_m2.vertedero_emergencia.base import VertederoEmergenciaController
from alerts.modules.utils import single_state_create
from alerts.modules.base_states import EVENT_STATES
from base.fields import StringEnum


class Controller(VertederoEmergenciaController):
    name = "Falla o bloqueo del vertedero de emergencia"

    states = StringEnum(*EVENT_STATES, "A1")

    TEMPLATE = "ef-mvp.m1.triggers.vertedero"

    create = single_state_create("A1")
