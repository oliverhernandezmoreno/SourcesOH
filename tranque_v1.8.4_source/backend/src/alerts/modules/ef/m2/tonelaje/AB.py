from alerts.modules.rules import Rule
from alerts.modules.ef.m2.tonelaje.base import TonelajeController
from alerts.modules.base_states import EVENT_STATES
from base.fields import StringEnum


class Controller(TonelajeController):
    states = StringEnum(*EVENT_STATES, 'A1', 'B1')

    _relevant_events = ['A1', 'B1']

    create = Rule.assemble(
        Rule("save activation evidence")
        .save_events(A1_events=lambda e: e["value"] > 0 and e["name"].endswith("A1"))
        .save_events(B1_events=lambda e: e["value"] > 0 and e["name"].endswith("B1"))
        .save_events(raise_events=lambda e: e["value"] > 0)
        .stop(),

        Rule("activate automatically on trigger evidence")
        .when_context_property("B1_events")
        .then_update_by_events(
            events_prop="raise_events",
            state=states.B1,
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
        Rule("save activation evidence")
        .when_ticket_state(states.A1)
        .save_events(B1_events=lambda e: e["value"] > 0 and e["name"].endswith("B1"))
        .when_context_property("B1_events")
        .save_events(raise_events=lambda e: e["value"] > 0)
        .then_update_by_events(
            events_prop="raise_events",
            state=states.B1,
            highlight=True,
            description=Rule.ActionDescription.ESCALATE,
        ),
    )
