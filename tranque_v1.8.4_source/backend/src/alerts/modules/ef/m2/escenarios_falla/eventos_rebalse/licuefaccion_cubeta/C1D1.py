from alerts.modules.rules import Rule
from alerts.spreads import spread_sectors
from alerts.modules import base
from alerts.modules.base_states import EVENT_STATES
from .base import LicuefaccionCubetaController


@spread_sectors()
class Controller(LicuefaccionCubetaController):
    states = base.StringEnum(*EVENT_STATES, 'C1', 'D1')

    _relevant_events = ['C1', 'D1']

    create = Rule.assemble(
        Rule("save activation evidence")
        .save_events(C1_events=lambda e: e["value"] > 0 and e["name"].endswith("C1"))
        .save_events(D1_events=lambda e: e["value"] > 0 and e["name"].endswith("D1"))
        .save_events(raise_events=lambda e: e["value"] > 0)
        .stop(),

        Rule("activate automatically on trigger evidence")
        .when_context_property("D1_events")
        .then_update_by_events(
            events_prop="raise_events",
            state=states.D1,
            highlight=True,
            description=Rule.ActionDescription.CREATE,
        ),

        Rule("activate automatically on trigger evidence")
        .when_context_property("C1_events")
        .then_update_by_events(
            events_prop="raise_events",
            state=states.C1,
            highlight=True,
            description=Rule.ActionDescription.CREATE,
        ),
    )

    update = Rule.assemble(
        Rule("save activation evidence")
        .when_ticket_state(states.C1)
        .save_events(D1_events=lambda e: e["value"] > 0 and e["name"].endswith("D1"))
        .when_context_property("D1_events")
        .save_events(raise_events=lambda e: e["value"] > 0)
        .then_update_by_events(
            events_prop="raise_events",
            state=states.D1,
            highlight=True,
            description=Rule.ActionDescription.ESCALATE,
        ),
    )
