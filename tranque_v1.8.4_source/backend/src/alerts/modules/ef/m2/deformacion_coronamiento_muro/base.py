from alerts.modules.ef.ef_event import EFEventController
from alerts.modules.event_types import CRITICAL_PARAMETERS, DEFORMATIONS


PROFILE_DESCRIPTIONS = {
    'B1': 'Se detecta una tendencia desfavorable de la deformación del coronamiento \
    evaluada por monolitos en el eje transversal al coronamiento del muro.\n\n\
    Recomendación: Verificar el evento descrito revisando los puntos de monitoreo \
    más cercanos de la misma variable para intentar dimensionar la extensión del \
    problema, y de otras variables para confirmar la consistencia, además informar \
    al superior a cargo.',

    'B2': 'Se detecta una tendencia desfavorable de la deformación del coronamiento \
    evaluada por monolitos en el eje longitudinal al coronamiento del muro.\n\n\
    Recomendación: Verificar el evento descrito revisando los puntos de monitoreo \
    más cercanos de la misma variable para intentar dimensionar la extensión del \
    problema, y de otras variables para confirmar la consistencia, además informar \
    al superior a cargo.',

    'B3': 'Se detecta una tendencia desfavorable de la deformación del coronamiento \
    del muro evaluada por monolitos en el eje vertical (correspondiente a la cota \
    de elevación).\n\n\
    Recomendación: Verificar el evento descrito revisando los puntos de monitoreo \
    más cercanos de la misma variable para intentar dimensionar la extensión del \
    problema, y de otras variables para confirmar consistencia, además informar \
    al superior a cargo.',

    'B4': 'Se detecta una tendencia desfavorable de la deformación del coronamiento \
    evaluada por monolitos en el eje transversal al coronamiento del muro posterior \
    a un evento sísmico.\n\n\
    Recomendación: Verificar el evento descrito revisando los puntos de monitoreo \
    más cercanos de la misma variable para intentar dimensionar la extensión del \
    problema, y de otras variables para confirmar la consistencia, además informar \
    al superior a cargo.',

    'B5': 'Se detecta una tendencia desfavorable de la deformación del coronamiento \
    evaluada por monolitos en el eje longitudinal al coronamiento del muro posterior \
    a un evento sísmico.\n\n\
    Recomendación: Verificar el evento descrito revisando los puntos de monitoreo \
    más cercanos de la misma variable para intentar dimensionar la extensión del \
    problema, y de otras variables para confirmar la consistencia, además informar \
    al superior a cargo.',

    'B6': 'Se detecta una tendencia desfavorable de la deformación del coronamiento \
    del muro evaluada por monolitos en el eje vertical (correspondiente a la cota \
    de elevación) posterior a un evento sísmico.\n\n\
    Recomendación: Verificar el evento descrito revisando los puntos de monitoreo \
    más cercanos de la misma variable para intentar dimensionar la extensión del \
    problema, y de otras variables para confirmar la consistencia, además informar \
    al superior a cargo.',

    'C1': 'Se detecta que la deformación del coronamiento del muro en el eje \
    transversal al coronamiento evaluada por monolito supera el primer valor \
    umbral definido.\n\n\
    Recomendación: Verificar el evento descrito revisando los puntos de monitoreo \
    más cercanos de la misma variable para intentar dimensionar la extensión del \
    problema, y de otras variables para confirmar la consistencia, informar al \
    superior a cargo, consultar el manual de emergencia y, si no está considerado en \
    el manual consultar a un asesor experto en esa materia según los procedimientos \
    establecidos. Además, el responsable del depósito por parte de la Compañía Minera \
    debe verificar el estado del escenario de falla de inestabilidad de talud IT-02 03 \
    junto con considerar las gestiones necesarias dado que este evento está asociado \
    a una Alerta Amarilla.',

    'C2': 'Se detecta que la deformación del coronamiento del muro en el eje \
    longitudinal al coronamiento evaluada por monolito supera el segundo valor \
    umbral definido.\n\n\
    Recomendación: Verificar el evento descrito revisando los puntos de monitoreo \
    más cercanos de la misma variable para intentar dimensionar la extensión del \
    problema, y de otras variables para confirmar la consistencia, informar al \
    superior a cargo, consultar el manual de emergencia y, si no está considerado \
    en el manual consultar a un asesor experto en esa materia según los procedimientos \
    establecidos. Además, el responsable del depósito por parte de la Compañía \
    Minera debe verificar el estado del escenario de falla de inestabilidad de \
    talud IT-02 junto con considerar las gestiones necesarias dado que este evento \
    está asociado a una Alerta Amarilla.',

    'C3': 'Se detecta que la deformación del coronamiento del muro en el eje vertical \
    (correspondiente a la cota de elevación) evaluada por monolito supera el \
    tercer valor umbral definido.\n\n\
    Recomendación: Verificar el evento descrito revisando los puntos de monitoreo \
    más cercanos de la misma variable para intentar dimensionar la extensión del \
    problema, y de otras variables para confirmar la consistencia, informar al \
    superior a cargo, consultar el manual de emergencia y, si no está considerado en \
    el manual consultar a un asesor experto en esa materia según los procedimientos \
    establecidos. Además, el responsable del depósito por parte de la Compañía Minera \
    debe verificar el estado del escenario de falla de inestabilidad de talud IT-02 \
    junto con considerar las gestiones necesarias dado que este evento está asociado \
    a una Alerta Amarilla.'
}


class DeformacionCoronamientoController(EFEventController):
    name = "Deformación del coronamiento del muro"

    event_type = CRITICAL_PARAMETERS

    visibility_groups = (
        "ef",
        "ef.m2",
        "ef.m2.deformacion_coronamiento_muro",
        "mine",
        "authority"
    )

    def result_state(self, ticket):
        if ticket.state == self.CLOSED_STATE:
            return {'level': 0, 'short_message': self.name}
        return {
            'level': self.get_level(ticket),
            'short_message': self.name,
            'message': PROFILE_DESCRIPTIONS.get(ticket.state, ''),
            "event_type": self.event_type,
            "parameter": DEFORMATIONS
        }
