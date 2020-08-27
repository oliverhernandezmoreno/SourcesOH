from django.db.models import Q
from alerts.modules.ef.ef_event import EFEventController
from django.utils.decorators import classproperty
from alerts.modules.event_types import CRITICAL_PARAMETERS, DEFORMATIONS

PROFILE_DESCRIPTIONS = {
    'B1': 'Se detecta una tendencia desfavorable en el eje longitudinal al \
    coronamiento del muro de la deformación del suelo de fundación evaluada \
    por instrumento.\n\n\
    Recomendación: Verificar el evento descrito revisando los puntos de monitoreo \
    más cercanos de la misma variable para intentar dimensionar la extensión del \
    problema, y de otras variables para confirmar la consistencia, además informar \
    al superior a cargo.',

    'B2': 'Se detecta una tendencia desfavorable en el eje longitudinal al \
    coronamiento del muro de la deformación del suelo de fundación evaluada \
    por instrumento.\n\n\
    Recomendación: Verificar el evento descrito revisando los puntos de monitoreo \
    más cercanos de la misma variable para intentar dimensionar la extensión del \
    problema, y de otras variables para confirmar la consistencia, además informar \
    al superior a cargo.',

    'B3': 'Se detecta una tendencia desfavorable en el eje vertical (correspondiente \
    a la cota de elevación) de la deformación del suelo de fundación evaluada \
    por instrumento.\n\n\
    Recomendación: Verificar el evento descrito revisando los puntos de monitoreo \
    más cercanos de la misma variable para intentar dimensionar la extensión \
    del problema, y de otras variables para confirmar la consistencia, además \
    informar al superior a cargo.',

    'B4': 'Se detecta una tendencia desfavorable en el eje transversal al coronamiento \
    del muro de la deformación del suelo de fundación posterior a un evento sísmico, \
    evaluada por instrumento.\n\n\
    Recomendación: Verificar el evento descrito revisando los puntos de monitoreo \
    más cercanos de la misma variable para intentar dimensionar la extensión del \
    problema, y de otras variables para confirmar la consistencia, además informar \
    al superior a cargo.',

    'B5': 'Se detecta una tendencia desfavorable en el eje longitudinal al coronamiento \
    del muro de la deformación del suelo de fundación posterior a un evento sísmico, \
    evaluada por instrumento.\n\n\
    Recomendación: Verificar el evento descrito revisando los puntos de monitoreo \
    más cercanos de la misma variable para intentar dimensionar la extensión del \
    problema, y de otras variables para confirmar la consistencia, además informar \
    al superior a cargo.',

    'B6': 'Se detecta una tendencia desfavorable en el eje vertical (correspondiente \
    a la cota de elevación) de la deformación del suelo de fundación posterior a un \
    evento sísmico, evaluada por instrumento.\n\n\
    Recomendación: Verificar el evento descrito revisando los puntos de monitoreo \
    más cercanos de la misma variable para intentar dimensionar la extensión del \
    problema, y de otras variables para confirmar la consistencia, además informar \
    al superior a cargo',

    'C1': 'Se detecta que la deformación del suelo de fundación en el eje transversal \
    al coronamiento del muro a una profundidad determinada evaluada instrumentalmente \
    supera la primera serie de valores umbrales para ese eje definidos.\n\n\
    Recomendación: Verificar el evento descrito revisando los puntos de monitoreo \
    más cercanos de la misma variable para intentar dimensionar la extensión del \
    problema, y de otras variables para confirmar la consistencia, informar al \
    superior a cargo, consultar el manual de emergencia y, si no está considerado \
    en el manual, consultar a un asesor experto en esa materia según los \
    procedimientos establecidos.',

    'C2': 'Se detecta que la deformación del suelo de fundación en el eje longitudinal \
    al coronamiento del muro a una profundidad determinada evaluada instrumentalmente \
    supera la segunda serie de valores umbrales para ese eje definidos.\n\n\
    Recomendación: Verificar el evento descrito revisando los puntos de monitoreo más \
    cercanos de la misma variable para intentar dimensionar la extensión del problema, \
    y de otras variables para confirmar la consistencia, informar al superior a cargo, \
    consultar el manual de emergencia y, si no está considerado en el manual, consultar \
    a un asesor experto en esa materia según los procedimientos establecidos.',

    'C3': 'Se detecta que la deformación del suelo de fundación en el eje vertical \
    evaluada instrumentalmente supera la tercera serie de valores umbrales para \
    ese eje definidos.\n\n\
    Recomendación: Verificar el evento descrito revisando los puntos de monitoreo \
    más cercanos de la misma variable para intentar dimensionar la extensión del \
    problema, y de otras variables para confirmar la consistencia, informar al \
    superior a cargo, consultar el manual de emergencia y, si no está considerado \
    en el manual, consultar a un asesor experto en esa materia según los procedimientos \
    establecidos.'
}


class DeformacionSueloController(EFEventController):
    name = "Deformación del suelo de fundación"

    event_type = CRITICAL_PARAMETERS

    visibility_groups = (
        "ef",
        "ef.m2",
        "ef.m2.deformacion_suelo_fundacion",
        "mine",
        "authority"
    )

    @classproperty
    def relevant_events(cls):
        group = cls.spread_object()
        return [
            cls.event_query(Q(canonical_name='.'.join([
                group.target.canonical_name,
                f's-{group.hardware_id}',
                cls.TEMPLATE,
                suffix
            ])), 1)
            for suffix in cls._relevant_events
        ]

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
