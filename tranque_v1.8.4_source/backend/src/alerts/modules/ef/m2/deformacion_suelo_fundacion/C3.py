from django.db.models import Q
from alerts.modules import base
from alerts.modules.base import spread
from targets.models import DataSource
from .base import DeformacionSueloController
from alerts.modules.base_states import EVENT_STATES
from alerts.modules.utils import single_state_create


@spread(DataSource, Q(groups__canonical_name='inclinometros'))
class Controller(DeformacionSueloController):
    states = base.StringEnum(*EVENT_STATES, "C3")

    TEMPLATE = "ef-mvp.m2.parameters.deformacion.inclinometro.suelo.eje-z"

    relevant_events = [base.event_query(Q(template_name=TEMPLATE), 1)]

    create = single_state_create("C3")
