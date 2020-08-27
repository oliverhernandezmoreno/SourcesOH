from django.db.models import Q
from django.utils.decorators import classproperty
from alerts.modules.ef.ef_event import EFEventController
from alerts.modules.rules import Rule
from alerts.modules.base_states import EVENT_STATES
from base.fields import StringEnum


PROFILE_DESCRIPTIONS = {
    'B1': 'Revancha hidráulica < Primer valor umbral',
    'B2': 'Revancha hidráulica < Segundo valor umbral',
    'B3': 'Revancha hidráulica < Tercer valor umbral',
}


class Controller(EFEventController):
    name = "Revancha Hidráulica"

    states = StringEnum(*EVENT_STATES, 'B1', 'B2', 'B3')

    _relevant_events = ['B1', 'B2', 'B3']

    visibility_groups = (
        "ef",
        "m1",
        "ef.m1_m2",
        "ef.m1_m2.revancha_hidraulica",
        "mine",
        "authority"
    )

    TEMPLATE = "ef-mvp.m2.parameters.revancha-hidraulica"

    @classproperty
    def relevant_events(cls):
        return [
            cls.event_query(Q(template_name='.'.join([
                cls.TEMPLATE,
                suffix
            ])), 1)
            for suffix in cls._relevant_events
        ]

    def result_state(self, ticket):
        if ticket.state == self.CLOSED_STATE:
            return {'level': 0, 'short_message': self.name}
        return {
            'level': self.get_level(ticket),
            'short_message': self.name,
            'message': PROFILE_DESCRIPTIONS.get(ticket.state, ''),
            "reason": "exceed",
            "parameter": "topography"
        }

    create = Rule.assemble(
        Rule("save activation evidence")
        .save_events(B1_events=lambda e: e["value"] > 0 and e["name"].endswith("B1"))
        .save_events(B2_events=lambda e: e["value"] > 0 and e["name"].endswith("B2"))
        .save_events(B3_events=lambda e: e["value"] > 0 and e["name"].endswith("B3"))
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
        .when_context_property("B2_events")
        .then_update_by_events(
            events_prop="raise_events",
            state=states.B2,
            highlight=True,
            description=Rule.ActionDescription.CREATE,
        ),

        Rule("activate automatically on trigger evidence")
        .when_context_property("B1_events")
        .then_update_by_events(
            events_prop="raise_events",
            state=states.B1,
            highlight=True,
            description=Rule.ActionDescription.CREATE,
        ),
    )

    update = Rule.assemble(
        Rule("save activation evidence")
        .when_ticket_state(states.B1)
        .save_events(B2_events=lambda e: e["value"] > 0 and e["name"].endswith("B2"))
        .when_context_property("B2_events")
        .save_events(raise_events=lambda e: e["value"] > 0)
        .then_update_by_events(
            events_prop="raise_events",
            state=states.B2,
            highlight=True,
            description=Rule.ActionDescription.ESCALATE,
        ),

        Rule("save activation evidence")
        .when_ticket_state(states.B2)
        .save_events(B3_events=lambda e: e["value"] > 0 and e["name"].endswith("B3"))
        .when_context_property("B3_events")
        .save_events(raise_events=lambda e: e["value"] > 0)
        .then_update_by_events(
            events_prop="raise_events",
            state=states.B3,
            highlight=True,
            description=Rule.ActionDescription.ESCALATE,
        ),
    )
