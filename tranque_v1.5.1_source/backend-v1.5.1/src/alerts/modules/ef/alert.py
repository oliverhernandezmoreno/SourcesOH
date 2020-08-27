from alerts.modules.base_alert import BaseAlertController


class Controller(BaseAlertController):
    visibility_groups = (
        "ef",
        "mine",
        "authority",
    )

    children = ['*.ef.m1.*', '*.ef.m2.*']

    name = "Alerta de Estabilidad Física"

    def public_alert_abstract(self, ticket):
        if ticket.state == self.states.RED:
            return 'Resumen público de alerta roja EF'
        elif ticket.state == self.states.YELLOW:
            return 'Resumen público de alerta amarilla EF'
        else:
            return ''
