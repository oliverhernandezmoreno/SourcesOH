from django.db.models import Q
from django.utils.decorators import classproperty
from alerts.modules.ef.ef_event import EFEventController
from alerts.modules.event_types import CRITICAL_PARAMETERS, TOPOGRAPHY

PROFILE_DESCRIPTIONS = {
    'A1': 'Se detecta que la altura de coronamiento del muro evaluada en un perfil tiene una desviación \
    respecto del plan de crecimiento. El valor se ha superado en una cantidad mayor a su banda de tolerancia \
    por lo cual se está sobre el rango de altura proyectada en el plan de crecimiento.\n\n\
    Recomendación: Verificar el evento descrito y elaborar medidas para rectificar la altura del muro en el \
    sector afectado.',

    'A2': 'Se detecta que la altura de coronamiento del muro evaluada en un perfil se encuentra desviada \
    del plan de crecimiento. El valor medido es menor que el rango aceptable definido por la banda de \
    tolerancia.\n\n\
    Recomendación: Verificar el evento descrito y elaborar medidas para rectificar la altura del muro en el \
    sector afectado.',

    'A3': 'Se detecta una desviación de la altura de coronamiento con respecto al plan de crecimiento del \
    muro, al verificar que existen sectores con alturas irregulares producto de un crecimiento excesivo o que al \
    contrario están por debajo de la altura general del muro.\n\n\
    Recomendación: Confirmar la ocurrencia de la desviación y revisar las diferencias con las Especificaciones \
    Técnicas y planos de construcción.'
}


class AlturaCoronamientoController(EFEventController):
    name = "Altura de coronamiento del muro"

    event_type = CRITICAL_PARAMETERS

    visibility_groups = (
        "ef",
        "m1",
        "ef.m1_m2",
        "ef.m1_m2.altura_coronamiento",
        "mine",
    )

    @classproperty
    def relevant_events(cls):
        group = cls.spread_object()
        return [
            cls.event_query(Q(canonical_name='.'.join([
                group.target.canonical_name,
                f'g-{group.canonical_name}',
                'ef-mvp.m2.parameters.altura-muro.sector',
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
            "parameter": TOPOGRAPHY
        }
