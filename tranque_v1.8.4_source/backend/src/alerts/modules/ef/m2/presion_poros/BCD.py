from django.db.models import Q
from alerts.modules.base import spread
from targets.models import DataSource
from .base import PresionPorosController
from alerts.modules.base_states import EVENT_STATES
from base.fields import StringEnum

events = [
    'B4-1',
    'B4-2',
    'B5-1',
    'B5-2',
    'B5-3',
    'B5-4',
    'B6-1',
    'B6-2',
    'B6-3',
    'C1-1',
    'C1-2',
    'C1-3',
    'C1-4',
    'C1-5',
    'C1-6',
    'C2-1',
    'C2-2',
    'D1',
    'D2',
]


@spread(DataSource, Q(groups__canonical_name='piezometros'))
class Controller(PresionPorosController):
    states = StringEnum(*EVENT_STATES, *events)

    _relevant_events = events
