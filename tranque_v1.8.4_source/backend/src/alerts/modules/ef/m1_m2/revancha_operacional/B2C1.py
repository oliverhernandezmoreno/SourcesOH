from alerts.modules.rules import Rule
from alerts.spreads import spread_sectors
from .base import RevanchaOperacionalController
from alerts.modules.base_states import EVENT_STATES
from base.fields import StringEnum


@spread_sectors()
class Controller(RevanchaOperacionalController):
    states = StringEnum(*EVENT_STATES, 'B2', 'C1')

    _relevant_events = ['B2', 'C1']

    create = Rule.assemble(
        Rule("save activation evidence")
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
    )

    update = Rule.assemble(
        Rule("save activation evidence")
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
