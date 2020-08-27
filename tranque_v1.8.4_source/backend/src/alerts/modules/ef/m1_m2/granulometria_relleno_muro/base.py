from django.db.models import Q
from django.utils.decorators import classproperty
from alerts.modules.ef.ef_event import EFEventController
from alerts.modules.event_types import CRITICAL_PARAMETERS, GRANULOMETRY

PROFILE_DESCRIPTIONS = {
    'A1': 'Se detecta que la curva granulométrica de las arenas no cumple los \
    criterios de diseño.\n\n\
    Recomendación: Revisar y verificar el diseño del depósito.',

    'B1': 'Se detecta una desviación con respecto al diseño de la granulometría \
    del material del muro, lo cual indica que no se cumple con la utilización \
    de los materiales indicados por diseño para el crecimiento del muro del \
    depósito, verificando que la depositación del material o la conformación de \
    las capas de empréstitos que conforman el muro no son el correcto.\n\n\
    Recomendación: Confirmar la ocurrencia de la desviación, revisar las diferencias \
    con las Especificaciones Técnicas y planos de construcción e informar al \
    superior a cargo.',

    'B2': 'Se detecta que el porcentaje de finos del material de relleno del \
    muro supera el valor umbral establecido para las arenas de construcción del \
    muro del depósito.\n\n\
    Recomendación: Verificar el evento descrito e informar al superior a cargo.',
}


class GranulometriaRellenoMuroController(EFEventController):
    name = "Granulometría del material de relleno del muro"

    event_type = CRITICAL_PARAMETERS

    visibility_groups = (
        "ef",
        "m1",
        "ef.m1_m2",
        "ef.m1_m2.granulometria_relleno_muro",
        "mine"
    )

    TEMPLATE = "ef-mvp.m2.parameters.granulometria"

    @classproperty
    def relevant_events(cls):
        return [
            cls.event_query(Q(template_name='.'.join([
                cls.TEMPLATE,
                suffix
            ])), 1)
            for suffix in cls._relevant_events
        ]

    def result_state(self, ticket):
        if ticket.state == self.CLOSED_STATE:
            return self.no_result_state
        return {
            "level": self.get_level(ticket),
            "short_message": self.name,
            "message": PROFILE_DESCRIPTIONS.get(ticket.state, ''),
            "event_type": self.event_type,
            "parameter": GRANULOMETRY
        }
