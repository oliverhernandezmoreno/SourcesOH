from django.db.models import Q
from django.utils.decorators import classproperty
from alerts.modules.ef.ef_event import EFEventController
from alerts.modules.rules import Rule
from alerts.modules.base_states import EVENT_STATES
from base.fields import StringEnum


class Level2BaseController(EFEventController):
    visibility_groups = (
        "ef",
        "ef.m1",
        "ef.m1.level2",
        "mine",
        "authority",
    )

    states = StringEnum(*EVENT_STATES)

    # override
    timeseries_templates = []

    @classproperty
    def relevant_events(cls):
        return [
            cls.event_query(Q(template_name=template))
            for template in cls.timeseries_templates
        ]

    def should_propagate(self, ticket):
        return True

    def result_state(self, ticket):
        if ticket.state == self.CLOSED_STATE:
            return {"level": 0, "short_message": self.name}
        return {
            "level": self.get_level(ticket),
            "short_message": self.name,
            "message": self.description,
            "reason": "byUser",
            "parameter": "earthquake"
        }

    create_by_intent = Rule.assemble(
        Rule("activate when intent is B")
        .when_intent_state(states.B)
        .then_update_by_intent(highlight=True, description=Rule.ActionDescription.CREATE),

        Rule("activate when intent is C")
        .when_intent_state(states.C)
        .then_update_by_intent(highlight=True, description=Rule.ActionDescription.CREATE),

        Rule("block anything else")
        .then_issue("BLOCKED_BY_RULES"),
    )

    create = Rule.assemble(
        Rule("activate automatically when an event is > 0")
        .save_events(raise_events=lambda event: event["value"] > 0)
        .when_context_property("raise_events")
        .then_update_by_events(
            events_prop="raise_events",
            state=EFEventController.states.B,
            highlight=True,
            description=Rule.ActionDescription.CREATE,
        ),
    )

    update_by_intent = Rule.assemble(
        Rule("close when the authority requests it")
        .when_attempts_closing()
        .when_user_is_authority()
        .then_close_by_intent(description=Rule.ActionDescription.CLOSE),

        Rule("close on operator request when state is B and there's documentation")
        .when_attempts_closing()
        .when_ticket_state(EFEventController.states.B)
        .when_user_is_mine()
        .then_close_by_intent(description=Rule.ActionDescription.CLOSE),

        Rule("block closing if there's no documentation")
        .when_attempts_closing()
        .when_ticket_state(EFEventController.states.B)
        .when_user_is_mine()
        .then_issue("INSUFFICIENT_INFORMATION"),

        Rule("block closing if the state is above B")
        .when_attempts_closing()
        .then_issue("INSUFFICIENT_PERMISSIONS"),

        Rule("Archive the ticket")
        .when_attempts_archiving(True)
        .then_update_by_intent(description=Rule.ActionDescription.ARCHIVE, archived=True),

        Rule("Unarchive the ticket")
        .when_attempts_archiving(False)
        .then_update_by_intent(description=Rule.ActionDescription.ARCHIVE, archived=False),

        Rule("save escalation evidence")
        .save(escalation=lambda ctx: ctx.intent.content["state"] > ctx.controller.ticket.state)
        .stop(),

        Rule("escalate on authority request and escalation evidence")
        .when_context_property("escalation")
        .when_user_is_authority()
        .then_update_by_intent(highlight=True, description=Rule.ActionDescription.ESCALATE),

        Rule("escalate on operator request, escalation evidence and documentation")
        .when_context_property("escalation")
        .when_user_is_mine()
        .then_update_by_intent(highlight=True, description=Rule.ActionDescription.ESCALATE),

        Rule("block the above if there's no documentation")
        .when_context_property("escalation")
        .when_user_is_mine()
        .then_issue("INSUFFICIENT_INFORMATION"),

        Rule("block any other escalation")
        .when_context_property("escalation")
        .then_issue("INSUFFICIENT_PERMISSIONS"),

        Rule("block anything else")
        .then_issue("BLOCKED_BY_RULES"),
    )

    update = Rule.assemble(
        Rule("log any extra escalation event")
        .save_events(raise_events=lambda event: event["value"] > 0)
        .when_context_property("raise_events")
        .then_update_by_events(
            events_prop="raise_events",
            description="Formulario de inspección reitera el incidente",
        ),
    )
