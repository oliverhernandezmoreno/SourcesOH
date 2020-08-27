from django.db.models import Q
from django.utils.decorators import classproperty
from alerts.modules.base import spread
from targets.models import DataSource
from alerts.modules.ef.m1_m2.integridad_sistema_drenaje.base import IntegridadSistemaDrenajeController
from alerts.modules.rules import Rule
from alerts.modules.base_states import EVENT_STATES
from base.fields import StringEnum


@spread(DataSource, Q(groups__canonical_name='piezometros'))
class Controller(IntegridadSistemaDrenajeController):
    states = StringEnum(*EVENT_STATES, 'B3', 'C1-1', 'C1-2')

    _relevant_events = ['B3', 'C1-1', 'C1-2']

    @classproperty
    def relevant_events(cls):
        source = cls.spread_object()
        return [
            cls.event_query(Q(canonical_name='.'.join([
                source.target.canonical_name,
                f's-{source.hardware_id}',
                'ef-mvp.m2.parameters.presion-poros.integridad-sistema-drenaje',
                suffix
            ])), 1)
            for suffix in cls._relevant_events
        ]

    create = Rule.assemble(
        Rule("save activation evidence")
        .save_events(B3_events=lambda e: e["value"] > 0 and e["name"].endswith("B3"))
        .save_events(C1_1_events=lambda e: e["value"] > 0 and e["name"].endswith("C1-1"))
        .save_events(C1_2_events=lambda e: e["value"] > 0 and e["name"].endswith("C1-2"))
        .save_events(raise_events=lambda e: e["value"] > 0)
        .stop(),

        Rule("activate automatically on trigger evidence")
        .when_context_property("B3_events")
        .then_update_by_events(
            events_prop="raise_events",
            state=states.B3,
            highlight=True,
            description=Rule.ActionDescription.CREATE,
        ),

        Rule("activate automatically on trigger evidence")
        .when_context_property("C1_1_events")
        .then_update_by_events(
            events_prop="raise_events",
            state=getattr(states, 'C1-1'),
            highlight=True,
            description=Rule.ActionDescription.CREATE,
        ),

        Rule("activate automatically on trigger evidence")
        .when_context_property("C1_2_events")
        .then_update_by_events(
            events_prop="raise_events",
            state=getattr(states, 'C1-2'),
            highlight=True,
            description=Rule.ActionDescription.CREATE,
        ),
    )

    update = Rule.assemble(
        Rule("save activation evidence")
        .when_ticket_state(states.B3)
        .save_events(C1_1_events=lambda e: e["value"] > 0 and e["name"].endswith("C1-1"))
        .when_context_property("C1_1_events")
        .save_events(raise_events=lambda e: e["value"] > 0)
        .then_update_by_events(
            events_prop="raise_events",
            state=getattr(states, 'C1-1'),
            highlight=True,
            description=Rule.ActionDescription.ESCALATE,
        ),

        Rule("save activation evidence")
        .when_ticket_state(states.B3)
        .save_events(C1_2_events=lambda e: e["value"] > 0 and e["name"].endswith("C1-2"))
        .when_context_property("C1_2_events")
        .save_events(raise_events=lambda e: e["value"] > 0)
        .then_update_by_events(
            events_prop="raise_events",
            state=getattr(states, 'C1-2'),
            highlight=True,
            description=Rule.ActionDescription.ESCALATE,
        ),
    )
