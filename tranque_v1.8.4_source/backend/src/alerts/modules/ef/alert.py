from alerts.modules.base_alert import BaseAlertController

ALERT_DESCRIPTIONS = {
    'YELLOW': 'Corresponde a una alerta, visible para el sitio público, generada producto de toda situación \
    anormal en el depósito de relaves que compromete su estabilidad física.\n\n\
    Recomendación: Se debe recopilar toda la información asociada a el o los eventos que generaron la alerta \
    (por ejemplo, registros de variables, fotografías e inspecciones) con su debida identificación de tiempo y \
    ubicación. Posteriormente, se debe realizar un seguimiento detallado de la zona afectada y de las variables \
    involucradas. Se sugiere adjuntar los comentarios o documentación asociada a la gestión de la alerta, \
    generar un comunicado sobre la situación actual de la Alerta Amarilla al sitio público. Se requiere \
    intensificar el monitoreo, la inspección y el control de parte de la Compañía Minera y la Autoridad.',

    'RED': 'Corresponde a una alerta, visible para el sitio público, generada producto de toda situación \
    crítica en el depósito de relaves que requiere la activación del protocolo de evacuación vigente.\n\n\
    Recomendación: Verificar la correcta activación del protocolo de evacuación y realizar un seguimiento de \
    su cumplimiento. Posterior a esto, se debe recopilar toda la información asociada a el o los eventos que \
    generaron la alerta, incluyendo registros de variables, fotografías e inspecciones, entre otras, con su debida \
    identificación de tiempo y ubicación, además de realizar un seguimiento detallado del área afectada por la \
    falla y de las variables involucradas. Por último, se debe adjuntar la documentación asociada al acta del \
    COE cuando esté disponible. La Compañía Minera mantendrá comunicación continua con la Autoridad \
    sobre la evolución de la evacuación y desarrollo de los protocolos de emergencia en la faena y con las \
    comunidades afectadas.'
}

ALERT_NAMES = {
    'YELLOW': 'Alerta amarilla',
    'RED': 'Alerta Roja'
}


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

    def result_state(self, ticket):
        if ticket.state == self.CLOSED_STATE:
            return {"level": 0, "short_message": self.name}
        return {
            "level": self.get_level(ticket),
            "short_message": ALERT_NAMES.get(ticket.state, self.name),
            "message": ALERT_DESCRIPTIONS.get(ticket.state, '')
        }
