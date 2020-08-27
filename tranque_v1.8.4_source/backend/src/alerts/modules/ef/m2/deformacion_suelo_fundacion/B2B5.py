from django.db.models import Q
from alerts.modules.base import spread
from targets.models import DataSource
from base.fields import StringEnum
from alerts.modules.rules import Rule
from alerts.modules.base_states import EVENT_STATES
from .base import DeformacionSueloController


@spread(DataSource, Q(groups__canonical_name='inclinometros'))
class Controller(DeformacionSueloController):
    states = StringEnum(*EVENT_STATES, 'B2', 'B5')

    _relevant_events = ['B2', 'B5']

    TEMPLATE = 'ef-mvp.m2.parameters.deformacion.inclinometro.suelo.eje-y'

    create = Rule.assemble(
        Rule("save activation evidence")
        .save_events(B5_events=lambda e: e["value"] > 0 and e["name"].endswith("B5"))
        .save_events(B2_events=lambda e: e["value"] > 0 and e["name"].endswith("B2"))
        .save_events(raise_events=lambda e: e["value"] > 0)
        .stop(),

        Rule("activate automatically on trigger evidence")
        .when_context_property("B5_events")
        .then_update_by_events(
            events_prop="raise_events",
            state=states.B5,
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
        .save_events(B5_events=lambda e: e["value"] > 0 and e["name"].endswith("B5"))
        .when_context_property("B5_events")
        .save_events(raise_events=lambda e: e["value"] > 0)
        .then_update_by_events(
            events_prop="raise_events",
            state=states.B5,
            highlight=True,
            description=Rule.ActionDescription.ESCALATE,
        ),
    )
