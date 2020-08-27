from django.db.models import Q
from django.utils.decorators import classproperty
from alerts.modules.ef.m2.base import M2BaseController
from alerts.spreads import spread_sectors
from alerts.modules.rules import Rule
from alerts.modules.base_states import EVENT_STATES
from base.fields import StringEnum

PROFILE_DESCRIPTIONS = {
    'B1': 'Valor pendiente >= Valor Umbral - Valor Umbral ∙ α1 (%)',
    'B2': 'Valor pendiente >= Valor Umbral',
}


@spread_sectors()
class Controller(M2BaseController):
    name = "Pendiente de playa"

    visibility_groups = (
        *M2BaseController.visibility_groups,
        "ef.m2.pendiente_playa",
    )

    states = StringEnum(*EVENT_STATES, 'B1', 'B2')

    _relevant_events = ['B1', 'B2']

    @classproperty
    def relevant_events(cls):
        group = cls.spread_object()
        return [
            cls.event_query(Q(canonical_name='.'.join([
                group.target.canonical_name,
                f'g-{group.canonical_name}',
                'ef-mvp.m2.parameters.pendiente-playa.sector',
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
        .save_events(raise_events=lambda e: e["value"] > 0)
        .stop(),

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
        Rule("auto escalate B1 -> B2")
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
    )
