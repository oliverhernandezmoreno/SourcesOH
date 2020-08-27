from django.db.models import Q
from alerts.modules.base import spread
from targets.models import DataSource
from .base import PresionPorosController
from alerts.modules.base_states import EVENT_STATES
from base.fields import StringEnum


@spread(DataSource, Q(groups__canonical_name='piezometros'))
class Controller(PresionPorosController):
    states = StringEnum(*EVENT_STATES, 'B2')

    _relevant_events = ['B2']
