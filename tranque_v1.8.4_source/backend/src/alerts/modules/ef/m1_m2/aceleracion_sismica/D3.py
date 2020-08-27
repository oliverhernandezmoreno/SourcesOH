from django.db.models import Q
from alerts.modules.base import spread
from targets.models import DataSource
from alerts.modules.ef.m1_m2.aceleracion_sismica.base import AceleracionSismicaController
from alerts.modules.utils import single_state_create
from alerts.modules.base_states import EVENT_STATES
from base.fields import StringEnum


@spread(DataSource, Q(groups__canonical_name='acelerografos'))
class Controller(AceleracionSismicaController):
    states = StringEnum(*EVENT_STATES, 'D3')

    _relevant_events = ['D3']

    create = single_state_create('D3')
