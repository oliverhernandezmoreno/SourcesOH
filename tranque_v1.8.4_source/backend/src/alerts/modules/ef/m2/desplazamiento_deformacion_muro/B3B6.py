from django.db.models import Q
from alerts.modules.base import spread
from targets.models import DataSource
from base.fields import StringEnum
from alerts.modules.rules import Rule
from django.utils.decorators import classproperty
from alerts.modules.base_states import EVENT_STATES
from .base import DesplazamientoDeformacionController


@spread(DataSource, Q(groups__canonical_name='monolitos'))
class Controller(DesplazamientoDeformacionController):
    states = StringEnum(*EVENT_STATES, 'B3', 'B6')

    _relevant_events = ['B3', 'B6']

    TEMPLATE = 'ef-mvp.m2.parameters.deformacion.monolito.muro.eje-z'

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

    create = Rule.assemble(
        Rule("save activation evidence")
        .save_events(B6_events=lambda e: e["value"] > 0 and e["name"].endswith("B6"))
        .save_events(B3_events=lambda e: e["value"] > 0 and e["name"].endswith("B3"))
        .save_events(raise_events=lambda e: e["value"] > 0)
        .stop(),

        Rule("activate automatically on trigger evidence")
        .when_context_property("B6_events")
        .then_update_by_events(
            events_prop="raise_events",
            state=states.B6,
            highlight=True,
            description=Rule.ActionDescription.CREATE,
        ),

        Rule("activate automatically on trigger evidence")
        .when_context_property("B3_events")
        .then_update_by_events(
            events_prop="raise_events",
            state=states.B3,
            highlight=True,
            description=Rule.ActionDescription.CREATE,
        ),
    )

    update = Rule.assemble(
        Rule("save activation evidence")
        .when_ticket_state(states.B3)
        .save_events(B6_events=lambda e: e["value"] > 0 and e["name"].endswith("B6"))
        .when_context_property("B6_events")
        .save_events(raise_events=lambda e: e["value"] > 0)
        .then_update_by_events(
            events_prop="raise_events",
            state=states.B6,
            highlight=True,
            description=Rule.ActionDescription.ESCALATE,
        ),
    )
