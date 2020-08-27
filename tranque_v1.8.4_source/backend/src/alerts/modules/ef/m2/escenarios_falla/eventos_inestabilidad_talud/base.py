from django.db.models import Q
from django.utils.decorators import classproperty
from alerts.modules.ef.ef_event import EFEventController
from alerts.modules.event_types import FAILURE_SCENARIO


class InestabilidadTaludController(EFEventController):
    event_type = FAILURE_SCENARIO

    visibility_groups = (
        "ef",
        "m2",
        "ef.m2",
        "ef.m2.escenarios_falla",
        "ef.m2.escenarios_falla.eventos_inestabilidad_talud",
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
                cls.TEMPLATE,
                suffix
            ])), 1)
            for suffix in cls._relevant_events
        ]
