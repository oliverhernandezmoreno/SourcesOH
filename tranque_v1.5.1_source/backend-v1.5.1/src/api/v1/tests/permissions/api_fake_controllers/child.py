from alerts.modules.base import BaseController
from alerts.modules.base_states import ALERT_STATES, EVENT_STATES
from base.fields import StringEnum


class Controller(BaseController):
    name = 'API test, child controller'
    states = StringEnum(*ALERT_STATES, *EVENT_STATES)
