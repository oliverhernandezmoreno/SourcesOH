from django.db.models import Q
from alerts.modules.base import spread
from targets.models import DataSource
from alerts.modules.ef.m1_m2.integridad_sistema_drenaje.base import IntegridadSistemaDrenajeController
from alerts.modules.utils import single_state_create
from alerts.modules.base_states import EVENT_STATES
from base.fields import StringEnum


@spread(DataSource, Q(groups__canonical_name='caudalimetros'))
class Controller(IntegridadSistemaDrenajeController):
    states = StringEnum(*EVENT_STATES, 'B2')

    _relevant_events = ["B2"]

    create = single_state_create("B2")
