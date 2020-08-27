from base.fields import StringEnum

EVENT_STATES = StringEnum('A', 'B', 'C', 'D')
ALERT_STATES = StringEnum('YELLOW', 'RED')
CLOSED = 'system.closed'
NO_LEVEL = -1
AUTHORIZATION_LEVELS = ['miner-2', 'miner-3', 'authority-2', 'authority-3']
CONDITIONS_TYPES = StringEnum("comment", "authorization", "ticket", "event")
ALL_TICKET_STATES = [*EVENT_STATES, *ALERT_STATES, CLOSED]
