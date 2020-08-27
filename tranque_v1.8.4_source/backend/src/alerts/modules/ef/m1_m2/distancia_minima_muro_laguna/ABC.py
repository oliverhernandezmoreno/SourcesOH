from alerts.modules.rules import Rule
from alerts.spreads import spread_sectors
from alerts.modules.ef.m1_m2.distancia_minima_muro_laguna.base import DistanciaMuroLagunaController
from alerts.modules.base_states import EVENT_STATES
from base.fields import StringEnum

events = [
    'A1',
    'B2',
    'C1',
]


@spread_sectors()
class Controller(DistanciaMuroLagunaController):
    states = StringEnum(*EVENT_STATES, *events)

    _relevant_events = events

    create = Rule.assemble(
        Rule("save activation evidence")
        .save_events(A1_events=lambda e: e["value"] > 0 and e["name"].endswith("A1"))
        .save_events(B2_events=lambda e: e["value"] > 0 and e["name"].endswith("B2"))
        .save_events(C1_events=lambda e: e["value"] > 0 and e["name"].endswith("C1"))
        .save_events(raise_events=lambda e: e["value"] > 0)
        .stop(),

        Rule("activate automatically on trigger evidence")
        .when_context_property("C1_events")
        .then_update_by_events(
            events_prop="raise_events",
            state=states.C1,
            highlight=True,
            description=Rule.ActionDescription.CREATE,
        ),

        Rule("activate automatically on trigger evidence")
        .when_context_property("B2_events")
        .then_update_by_events(
            events_prop="raise_events",
            state=states.B2,
            highlight=True,
            description=Rule.ActionDescription.CREATE,
        ),

        Rule("activate automatically on trigger evidence")
        .when_context_property("A1_events")
        .then_update_by_events(
            events_prop="raise_events",
            state=states.A1,
            highlight=True,
            description=Rule.ActionDescription.CREATE,
        ),
    )

    update = Rule.assemble(
        Rule("auto escalate A1 -> B2")
        .when_ticket_state(states.A1)
        .save_events(B2_events=lambda e: e["value"] > 0 and e["name"].endswith("B2"))
        .when_context_property("B2_events")
        .save_events(raise_events=lambda e: e["value"] > 0)
        .then_update_by_events(
            events_prop="raise_events",
            state=states.B2,
            highlight=True,
            description=Rule.ActionDescription.ESCALATE,
        ),

        Rule("auto escalate B2 -> C1")
        .when_ticket_state(states.B2)
        .save_events(C1_events=lambda e: e["value"] > 0 and e["name"].endswith("C1"))
        .when_context_property("C1_events")
        .save_events(raise_events=lambda e: e["value"] > 0)
        .then_update_by_events(
            events_prop="raise_events",
            state=states.C1,
            highlight=True,
            description=Rule.ActionDescription.ESCALATE,
        ),
    )
