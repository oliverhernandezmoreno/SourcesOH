from alerts.modules.rules import Rule
from alerts.modules.ef.m1_m2.potencial_rebalse.base import PotencialRebalseController
from alerts.modules.base_states import EVENT_STATES
from base.fields import StringEnum


class Controller(PotencialRebalseController):
    states = StringEnum(*EVENT_STATES, 'A3', 'B4')

    _relevant_events = ['A3', 'B4']

    create = Rule.assemble(
        Rule("save activation evidence")
        .save_events(A3_events=lambda e: e["value"] > 0 and e["name"].endswith("A3"))
        .save_events(B4_events=lambda e: e["value"] > 0 and e["name"].endswith("B4"))
        .save_events(raise_events=lambda e: e["value"] > 0)
        .stop(),

        Rule("activate automatically on trigger evidence")
        .when_context_property("B4_events")
        .then_update_by_events(
            events_prop="raise_events",
            state=states.B4,
            highlight=True,
            description=Rule.ActionDescription.CREATE,
        ),

        Rule("activate automatically on trigger evidence")
        .when_context_property("A3_events")
        .then_update_by_events(
            events_prop="raise_events",
            state=states.A3,
            highlight=True,
            description=Rule.ActionDescription.CREATE,
        ),
    )

    update = Rule.assemble(
        Rule("save activation evidence")
        .when_ticket_state(states.A3)
        .save_events(B4_events=lambda e: e["value"] > 0 and e["name"].endswith("B4"))
        .when_context_property("B4_events")
        .save_events(raise_events=lambda e: e["value"] > 0)
        .then_update_by_events(
            events_prop="raise_events",
            state=states.B4,
            highlight=True,
            description=Rule.ActionDescription.ESCALATE,
        ),
    )
