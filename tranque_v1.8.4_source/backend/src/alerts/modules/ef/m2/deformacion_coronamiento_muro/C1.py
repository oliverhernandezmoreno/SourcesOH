from django.db.models import Q
from alerts.modules import base
from alerts.modules.base import spread
from targets.models import DataSource
from .base import DeformacionCoronamientoController
from alerts.modules.base_states import EVENT_STATES
from alerts.modules.utils import single_state_create


@spread(DataSource, Q(groups__canonical_name='monolitos'))
class Controller(DeformacionCoronamientoController):
    states = base.StringEnum(*EVENT_STATES, "C1")

    TEMPLATE = "ef-mvp.m2.parameters.deformacion.monolito.coronamiento.eje-x"

    relevant_events = [base.event_query(Q(template_name=TEMPLATE), 1)]

    create = single_state_create("C1")
