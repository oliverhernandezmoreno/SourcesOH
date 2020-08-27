from django.db.models import Q
from django.utils.decorators import classproperty
from alerts.spreads import spread_sectors
from alerts.modules import base
from alerts.modules.ef.ef_event import EFEventController
from alerts.modules.rules import Rule
from alerts.modules.base_states import EVENT_STATES
from base.fields import StringEnum


@spread_sectors()
class Controller(EFEventController):

    name = "Presencia de grietas en un sector del muro"

    states = StringEnum(*EVENT_STATES, "C1", "C2", "C3")

    children = base.StringEnum(
        GRIETAS="_.ef.pc.grietas",
        TERREMOTO="_.ef.m1.level2.terremoto-4-6",
        DESLIZAMIENTO="_.ef.m1.level2.deslizamiento-menor",
    )

    visibility_groups = (
        "ef",
        "ef.pc",
        "mine",
        "authority",
    )

    TEMPLATE = "ef-mvp.m2.parameters.discrete.inputs.grietas"

    @classproperty
    def relevant_events(cls):
        return [cls.event_query(
            Q(template_name=cls.TEMPLATE) &
            Q(data_source_group=cls.spread_object())
        )]

    def should_propagate(self, ticket):
        return True

    def result_state(self, ticket):
        if ticket.state == self.CLOSED_STATE:
            return self.no_result_state
        return {
            "level": self.get_level(ticket),
            "short_message": self.name,
            "message": {
                self.states.C1: (
                    "Se determinó que las grietas detectadas ponen en riesgo la "
                    "integridad del muro"
                ),
                self.states.C2: (
                    "Se detectaron grietas posteriores a un evento sísmico "
                    "y se determinó que éstas ponen en riesgo la integridad del muro"
                ),
                self.states.C3: (
                    "Se detectaron grietas longitudinales posteriores a un "
                    "deslizamiento superficial que indican evidencia de un "
                    "deslizamiento mayor que pone en riesgo la integridad del muro"
                ),
            }.get(ticket.state, self.name),
            "reason": "combine",
            "parameter": "deformations"
        }

    create_by_intent = Rule.assemble(
        Rule("activate when intent is C1")
        .when_intent_state(states.C1)
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
            state=states.C1,
            highlight=True,
            description=Rule.ActionDescription.CREATE,
        ),
    )

    update_by_intent = Rule.assemble(
        Rule("close when the authority requests it")
        .when_attempts_closing()
        .when_user_is_authority()
        .then_close_by_intent(description=Rule.ActionDescription.CLOSE),

        Rule("reject any other closing attempt")
        .when_attempts_closing()
        .then_issue("INSUFFICIENT_PERMISSIONS"),

        Rule("escalate C1 -> C2 on any request and child ticket")
        .when_ticket_state(states.C1)
        .when_intent_state(states.C2)
        .when_one_child(children.TERREMOTO)
        .then_update_by_intent(highlight=True, description=Rule.ActionDescription.ESCALATE),

        Rule("escalate C1 -> C3 on any request and child ticket")
        .when_ticket_state(states.C1)
        .when_intent_state(states.C3)
        .when_one_child(children.DESLIZAMIENTO)
        .then_update_by_intent(highlight=True, description=Rule.ActionDescription.ESCALATE),

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
            description="Operador confirma incidente en sector del muro",
        ),
    )
