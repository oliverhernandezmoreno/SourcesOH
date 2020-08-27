from django.db.models import Q
from django.utils.decorators import classproperty
from alerts.modules.event_types import CRITICAL_PARAMETERS, PORE_PRESSURE
from alerts.modules.ef.m2.base import M2BaseController

shared_descriptions = {
    'B4': 'Se detecta que un instrumento mide una presión de poros mayor al primer o segundo valor \
    umbral en un sector del muro.\n\n\
    Recomendación: Verificar el evento descrito e informar al superior a cargo. Posteriormente, corroborar la \
    tendencia mediante la revisión de los puntos de medición aguas arriba y aguas abajo sobre el mismo eje de \
    escurrimiento y luego revisar los puntos de medición en los ejes transversales al escurrimiento. En caso de \
    corroborar el problema se sugiere la validación manual de los puntos de medición afectados.',

    'B5': 'Se detecta que un punto de medición de presión de poros en un sector del muro forma parte \
    de un grupo de dos o más puntos de medición que superan el primer o segundo valor umbral, y que no es \
    posible validar sus lecturas con otros puntos de medición.\n\n\
    Recomendación: Verificar el evento descrito e informar al superior a cargo. Posteriormente, corroborar la \
    tendencia mediante la revisión de los puntos de medición aguas arriba y aguas abajo sobre el mismo eje de \
    escurrimiento y luego revisar los puntos de medición en los ejes transversales al escurrimiento. En caso de \
    corroborar el problema se sugiere la validación manual de los puntos de medición afectados. Además, el \
    responsable del depósito por parte de la Compañía Minera debe verificar el estado de los escenarios de \
    falla de inestabilidad de talud IT-01, IT-02, IT-04, IT-05, IT-06 y de erosión interna EI-01, EI-03.',

    'B6': 'Se detecta que un punto de medición de presión de poros en un sector del muro forma parte \
    de un grupo de uno o más puntos de medición que superan el primer valor umbral y cuyas lecturas han sido \
    validadas manualmente por el operador.\n\n\
    Recomendación: Verificar el evento descrito e informar al superior a cargo. Posteriormente, corroborar la \
    tendencia mediante la revisión de los puntos de medición aguas arriba y aguas abajo sobre el mismo eje de \
    escurrimiento y luego revisar los puntos de medición en los ejes transversales al escurrimiento. Además, el \
    responsable del depósito por parte de la Compañía Minera debe verificar el estado de los escenarios de \
    falla de inestabilidad de talud IT-01, IT-02, IT-04, IT-05, IT-06 y de erosión interna EI-01, EI-03.',

    'C1': 'Se detecta que un punto de medición de presión de poros en un sector del muro forma parte \
    de un grupo de dos o más puntos de medición que superan el primer o segundo valor umbral y es posible \
    verificar sus lecturas con puntos de medición capaces de validar la información de los puntos de medición \
    que superaron el primer valor umbral.\n\n\
    Recomendación: Verificar el evento descrito e informar al superior a cargo. Posteriormente, corroborar la \
    tendencia mediante la revisión de los puntos de medición aguas arriba y aguas abajo sobre el mismo eje de \
    escurrimiento y luego revisar los puntos de medición en los ejes transversales al escurrimiento. En caso de \
    corroborar el problema, se sugiere la validación manual de los puntos de medición afectados. Consultar el \
    manual de emergencia y si no está considerado en el manual consultar a un asesor experto en esa materia \
    según los procedimientos establecidos. Además, el responsable del depósito por parte de la Compañía \
    Minera debe verificar el estado de los escenarios de falla de inestabilidad IT-01, IT-02, IT-03, IT-04, IT-05, \
    IT-06 y de erosión interna EI-01, EI-03 junto con considerar las gestiones necesarias dado que este evento \
    está asociado a una Alerta Amarilla.',

    'C2': 'Se detecta que un punto de medición de presión de poros en un sector del muro forma parte \
    de un grupo de uno o más puntos de medición que superan el primer o segundo valor umbral y se ha \
    validado manualmente la lectura de al menos un punto de medición que ha superado el primer valor \
    umbral.\n\n\
    Recomendación: Verificar el evento descrito e informar al superior a cargo. Posteriormente, corroborar la \
    tendencia mediante la revisión de los puntos de medición aguas arriba y aguas abajo sobre el mismo eje de \
    escurrimiento y luego revisar los puntos de medición en los ejes transversales al escurrimiento. Consultar \
    el manual de emergencia y si no está considerado en el manual consultar a un asesor experto en esa materia \
    según los procedimientos establecidos. Además, el responsable del depósito por parte de la Compañía \
    Minera debe verificar el estado de los escenarios de falla de inestabilidad de talud IT-01, IT-02, IT-03, IT-04, \
    IT-05, IT-06 y de erosión interna EI-01, EI-03 junto con considerar las gestiones necesarias dado que este \
    evento está asociado a una Alerta Amarilla.'
}

PROFILE_DESCRIPTIONS = {
    'B1': 'Se detecta una tendencia desfavorable asociado a un instrumento de medición de presión de \
    poros. Esto significa que si continúa la tasa de crecimiento actual de la presión de poros, ésta superará el \
    primer valor umbral en un tiempo igual al tiempo crítico.\n\n\
    Recomendación: Verificar el evento descrito e informar al superior a cargo. Posteriormente, corroborar la \
    tendencia mediante la revisión de los puntos de medición aguas arriba y aguas abajo sobre el mismo eje de \
    escurrimiento y luego revisar los puntos de medición en los ejes transversales al escurrimiento. Además, el \
    responsable del depósito por parte de la Compañía Minera debe verificar el estado del escenario de falla \
    de inestabilidad de talud IT-06.',

    'B2': 'Se detecta una tendencia desfavorable asociado a un instrumento de medición de presión de \
    poros. Esto significa que si continúa la tasa de crecimiento actual de la presión de poros, ésta superará el \
    segundo valor umbral en un tiempo igual al tiempo crítico.\n\n\
    Recomendación: Verificar el evento descrito e informar al superior a cargo. Posteriormente, corroborar la \
    tendencia mediante la revisión de los puntos de medición aguas arriba y aguas abajo sobre el mismo eje de \
    escurrimiento y luego revisar los puntos de medición en los ejes transversales al escurrimiento. Además, \
    el responsable del depósito por parte de la Compañía Minera debe verificar el estado del escenario de falla \
    de inestabilidad de talud IT-06.',

    'B3': 'Se detecta un cambio de tendencia en las presiones de poros en un instrumento posterior a un \
    evento sísmico.\n\n\
    Recomendación: Verificar el evento descrito e informar al superior a cargo. Posteriormente, corroborar el \
    cambio de tendencia mediante la revisión de los puntos de medición aguas arriba y aguas abajo sobre el \
    mismo eje de escurrimiento y luego revisar los puntos de medición en los ejes transversales al \
    escurrimiento, además de revisar variables asociadas a deformación. Por último, el responsable del \
    depósito por parte de la Compañía Minera debe verificar el estado del escenario de falla de inestabilidad \
    de talud IT-01.',

    'B4-1': shared_descriptions['B4'],
    'B4-2': shared_descriptions['B4'],

    'B5-1': shared_descriptions['B5'],
    'B5-2': shared_descriptions['B5'],
    'B5-3': shared_descriptions['B5'],
    'B5-4': shared_descriptions['B5'],

    'B6-1': shared_descriptions['B6'],
    'B6-2': shared_descriptions['B6'],
    'B6-3': shared_descriptions['B6'],

    'C1-1': shared_descriptions['C1'],
    'C1-2': shared_descriptions['C1'],
    'C1-3': shared_descriptions['C1'],
    'C1-4': shared_descriptions['C1'],
    'C1-5': shared_descriptions['C1'],
    'C1-6': shared_descriptions['C1'],

    'C2-1': shared_descriptions['C2'],
    'C2-2': shared_descriptions['C2'],

    'D1': 'Se detecta que un punto de medición de presión de poros en un sector del muro forma parte \
    de un grupo de dos o más puntos de medición que superan el primer o segundo valor umbral y es posible \
    verificar las lecturas con puntos de medición capaces de validar la información de los puntos de medición \
    que superaron el segundo valor umbral.\n\n\
    Recomendación: Detener todas las actividades operacionales y ejecutar el plan de evacuación. Además, \
    activar una revisión remota (por ejemplo, vuelos de dron, cámaras y aumentar frecuencia de monitoreo de \
    todas las variables automáticas) y planificar visitas de inspección una vez conocidos y controlados los riesgos \
    identificados en la revisión. Finalmente, el responsable del depósito por parte de la Compañía Minera debe \
    verificar el estado de los escenarios de falla de inestabilidad de talud IT-01, IT-02, IT-03, IT-04, IT-05, IT-06 \
    y de erosión interna EI-01, EI-03 junto con considerar las gestiones necesarias dado que este evento está \
    asociado a una Alerta Roja.',

    'D2': 'Se detecta que un punto de medición de presión de poros en un sector del muro forma parte \
    de un grupo de uno o más puntos de medición que superan el primer o segundo valor umbral y se ha \
    validado manualmente la lectura de al menos un punto de medición que ha superado el segundo valor \
    umbral.\n\n\
    Recomendación: Detener todas las actividades operacionales y ejecutar el plan de evacuación. Además, \
    activar una revisión remota (por ejemplo, vuelos de dron, cámaras y aumentar frecuencia de monitoreo de \
    todas las variables automáticas) y planificar visitas de inspección una vez conocidos y controlados los riesgos \
    identificados en la revisión. Además, el responsable del depósito por parte de la Compañía Minera debe \
    verificar el estado de los escenarios de falla de inestabilidad de talud IT-01, IT-02, IT-03, IT-04, IT-05, IT-06 \
    y de erosión interna EI-01, EI-03 junto con considerar las gestiones necesarias dado que este evento está \
    asociado a una Alerta Roja.',
}


class PresionPorosController(M2BaseController):
    name = "Presión de poros en el muro y suelo de fundación"

    visibility_groups = (
        *M2BaseController.visibility_groups,
        "ef.m2.presion_poros",
    )

    _relevant_events = []

    @classproperty
    def relevant_events(cls):
        obj = cls.spread_object()
        base = f'{obj.target.canonical_name}.s-{obj.hardware_id}.ef-mvp.m2.parameters.presion-poros.'
        return [
            # retrieve last event of every event
            cls.event_query(Q(canonical_name__startswith=f'{base}{suffix}'), 1)
            for suffix in cls._relevant_events
        ]

    def result_state(self, ticket):
        if ticket.state == self.CLOSED_STATE:
            return {'level': 0, 'short_message': self.name}
        return {
            'level': self.get_level(ticket),
            'short_message': self.name,
            'message': PROFILE_DESCRIPTIONS.get(ticket.state, ''),
            "event_type": CRITICAL_PARAMETERS,
            "parameter": PORE_PRESSURE
        }
