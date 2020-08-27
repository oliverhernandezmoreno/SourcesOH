from alerts.modules.base_alert import BaseAlertController


class Controller(BaseAlertController):
    visibility_groups = (
        "emac",
        "mine",
        "authority",
    )

    children = ['*.emac.events*']

    name = 'Alerta de afectación en Aguas Circundantes'

    def public_alert_abstract(self, ticket):
        if ticket.state == self.states.RED:
            return 'Resumen público de alerta roja EMAC'
        elif ticket.state == self.states.YELLOW:
            return 'Resumen público de alerta amarilla EMAC'
        else:
            return ''
