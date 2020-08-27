from django.db.models import Q
from django.utils.decorators import classproperty
from alerts.modules.ef.ef_event import EFEventController
from alerts.modules.event_types import CRITICAL_PARAMETERS, TOPOGRAPHY

PROFILE_DESCRIPTIONS = {
    'A1': 'Se detecta una desviación con respecto al diseño del ancho de coronamiento, lo cual indica que \
    no se cumple con el mínimo establecido por diseño. Para esto, se verificó que a lo largo del muro existen \
    sectores puntuales donde el ancho de coronamiento pueda ser menor y presentar valores cercanos al \
    mínimo establecido.\n\n\
    Recomendación: Confirmar la ocurrencia de la desviación y revisar las diferencias con las Especificaciones \
    Técnicas y planos de construcción.',

    'A2': 'Se detecta que el ancho de coronamiento evaluado en un perfil se encuentra cercano al primer \
    valor umbral definido.\n\n\
    Recomendación: Verificar el evento descrito y elaborar medidas para rectificar el ancho de coronamiento \
    del muro en el sector afectado.',

    'B1': 'Se detecta que el valor medido del ancho de coronamiento evaluado en un perfil es menor que \
    el valor umbral definido.\n\n\
    Recomendación: Verificar el evento descrito y elaborar medidas para el ancho de coronamiento del muro \
    en el sector afectado e informar al superior a cargo.',

    'B2': 'Se detecta que el valor medido del ancho de coronamiento evaluado en un perfil es menor que \
    el valor umbral durante tres meses o más.\n\n\
    Recomendación: Informar al superior a cargo, revisar o cambiar la metodología de remediación del evento \
    detectado y hacer un seguimiento a las medidas de mitigación.'
}


class AnchoCoronamientoController(EFEventController):
    name = "Ancho de coronamiento"

    event_type = CRITICAL_PARAMETERS

    visibility_groups = (
        "ef",
        "m1",
        "ef.m1_m2",
        "ef.m1_m2.ancho_coronamiento",
        "mine",
        "authority"
    )

    @classproperty
    def relevant_events(cls):
        group = cls.spread_object()
        return [
            cls.event_query(Q(canonical_name='.'.join([
                group.target.canonical_name,
                f'g-{group.canonical_name}',
                'ef-mvp.m2.parameters.ancho-coronamiento.sector',
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
