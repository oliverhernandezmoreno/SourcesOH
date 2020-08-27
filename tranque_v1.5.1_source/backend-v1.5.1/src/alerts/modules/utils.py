from alerts.modules.rules import Rule


def single_state_create(state):
    return Rule.assemble(
        Rule("activate automatically on raise events")
        .save_events(raise_events=lambda e: e["value"] > 0)
        .when_context_property("raise_events")
        .then_update_by_events(
            events_prop="raise_events",
            state=state,
            highlight=True,
            description=Rule.ActionDescription.CREATE

        )
    )
