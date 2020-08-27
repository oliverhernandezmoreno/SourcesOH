from django.db.models import Q
from alerts.modules.base_states import EVENT_STATES
from base.fields import StringEnum
from alerts.modules import base
from alerts.modules.rules import Rule
from alerts.modules.ef.ef_event import EFEventController


class Controller(EFEventController):
    name = "Presencia de grietas en el muro"

    states = StringEnum(*EVENT_STATES, "B1")

    visibility_groups = (
        "ef",
        "ef.pc",
        "mine",
        "authority",
    )

    TEMPLATE = "ef-mvp.m1.triggers.grietas"

    relevant_events = [base.event_query(Q(template_name=TEMPLATE))]

    def should_propagate(self, ticket):
        return True

    def result_state(self, ticket):
        if ticket.state == self.CLOSED_STATE:
            return self.no_result_state
        return {
            "level": self.get_level(ticket),
            "short_message": self.name,
            "message": self.name,
            "reason": "exceed",
            "parameter": "deformations"
        }

    create_by_intent = Rule.assemble(
        Rule("activate when intent is B1")
        .when_intent_state(states.B1)
        .then_update_by_intent(highlight=True, description=Rule.ActionDescription.CREATE),

        Rule("block any other activation attempt")
        .then_issue("BLOCKED_BY_RULES"),
    )

    create = Rule.assemble(
        Rule("save activation evidence")
        .save_events(raise_events=lambda e: e["value"] > 0)
        .stop(),

        Rule("activate automatically on trigger evidence")
        .when_context_property("raise_events")
        .then_update_by_events(
            events_prop="raise_events",
            state=states.B1,
            highlight=True,
            description=Rule.ActionDescription.CREATE,
        ),
    )

    update_by_intent = Rule.assemble(
        Rule("close when the authority requests it")
        .when_attempts_closing()
        .when_user_is_authority()
        .then_close_by_intent(description=Rule.ActionDescription.CLOSE),

        Rule("close on operator request when there's documentation")
        .when_attempts_closing()
        .when_user_is_mine()
        .when_intent_document()
        .then_close_by_intent(description=Rule.ActionDescription.CLOSE),

        Rule("reject the above on absence of documentation")
        .when_attempts_closing()
        .when_user_is_mine()
        .then_issue("INSUFFICIENT_INFORMATION"),

        Rule("reject any other closing attempt")
        .when_attempts_closing()
        .then_issue("INSUFFICIENT_PERMISSIONS"),

        Rule("block any other action")
        .then_issue("BLOCKED_BY_RULES")
    )

    update = Rule.assemble(
        Rule("save evidence")
        .save_events(raise_events=lambda e: e["value"] > 0)
        .stop(),

        Rule("log triggering evidence")
        .when_context_property("raise_events")
        .then_update_by_events(
            events_prop="raise_events",
            description="Formulario de inspección reitera el incidente",
        ),
    )
