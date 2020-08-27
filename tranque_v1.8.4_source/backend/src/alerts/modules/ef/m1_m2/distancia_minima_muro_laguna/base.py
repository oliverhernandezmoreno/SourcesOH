from django.db.models import Q
from django.utils.decorators import classproperty
from alerts.modules.ef.ef_event import EFEventController
from alerts.modules.event_types import CRITICAL_PARAMETERS, TOPOGRAPHY

PROFILE_DESCRIPTIONS = {
    'A1': 'Se detecta que la distancia mínima al muro de la laguna de aguas claras \
    es menor que el primer valor umbral definido.\n\n\
    Recomendación: Verificar el evento descrito.',

    'B1': 'Se detecta una desviación con respecto al diseño de la ubicación y el tamaño de la laguna, lo \
    cual indica que no se cumple con lo establecido en el plan de depositación, para esto se verificó que la \
    laguna se está desplazando por sectores irregulares o que se están formando lagunas secundarias en \
    sectores distintos a la laguna principal.\n\n\
    Recomendación: Confirmar la ocurrencia de la desviación, revisar las diferencias con las Especificaciones \
    Técnicas y planos de construcción e informar al superior a cargo.',

    'B2': 'Se detecta que la distancia mínima al muro de la laguna aguas claras es menor que el segundo \
    valor umbral definido.\n\n\
    Recomendación: Verificar el evento descrito e informar al superior a cargo. Además, el responsable del \
    depósito por parte de la Compañía Minera debe verificar el estado de los escenarios de falla de erosión \
    interna EI-01, EI-02, EI-03.',

    'C1': 'Se detecta que la distancia mínima al muro de la laguna de aguas claras es menor que el tercer \
    valor umbral definido, lo cual representa un riesgo para la estabilidad del depósito.\n\n\
    Recomendación: Verificar el evento descrito, informar al superior a cargo, consultar el manual de \
    emergencia y, si no está considerado en el manual, consultar a un asesor experto en esa materia según los \
    procedimientos establecidos. Además, el responsable del depósito por parte de la Compañía Minera debe \
    verificar el estado de los escenarios de falla de inestabilidad de talud IT-06 y de erosión interna EI-02, EI-03.'
}


class DistanciaMuroLagunaController(EFEventController):
    name = "Distancia mínima al muro de la laguna aguas claras"

    event_type = CRITICAL_PARAMETERS

    visibility_groups = (
        "ef",
        "m1",
        "ef.m1_m2",
        "ef.m1_m2.distancia_minima_muro_laguna",
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
                'ef-mvp.m2.parameters.distancia-laguna',
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
