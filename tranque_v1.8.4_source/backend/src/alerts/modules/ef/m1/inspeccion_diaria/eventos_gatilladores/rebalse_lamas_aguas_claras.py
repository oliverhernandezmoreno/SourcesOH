from alerts.modules.rules import Rule
from django.db.models import Q
from base.fields import StringEnum
from alerts.modules import base
from alerts.modules.ef.ef_event import EFEventController


class Controller(EFEventController):
    name = "Rebalse de lamas o aguas claras"

    states = StringEnum('C1', 'D1')

    visibility_groups = (
        "ef",
        "m1",
        "ef.m1",
        "ef.m1.inspeccion_diaria",
        "ef.m1.inspeccion_diaria.rebalse_lamas_aguas_claras",
        "mine",
        "authority"
    )

    TEMPLATE = 'ef-mvp.m1.triggers.critical.rebalse'

    relevant_events = [base.event_query(Q(template_name=TEMPLATE), 1)]

    def result_state(self, ticket):
        if ticket.state == self.CLOSED_STATE:
            return self.no_result_state
        return {
            "level": self.get_level(ticket),
            "short_message": self.name,
            "message": "Rebalse de lamas o aguas claras",
            "reason": "exceed",
            "parameter": "inspections"
        }

    create = Rule.assemble(
        Rule("save activation evidence")
        .save_events(D1_events=lambda e: e["value"] > 0 and e["name"].endswith("D1"))
        .save_events(C1_events=lambda e: e["value"] > 0 and e["name"].endswith("C1"))
        .save_events(raise_events=lambda e: e["value"] > 0)
        .stop(),

        Rule("activate automatically on trigger evidence")
        .when_context_property("D1_events")
        .then_update_by_events(
            events_prop="raise_events",
            state=states.D1,
            highlight=True,
            description="Se crea evento D1 asociado a rebalse de lamas o aguas claras",
        ),

        Rule("activate automatically on trigger evidence")
        .when_context_property("C1_events")
        .then_update_by_events(
            events_prop="raise_events",
            state=states.C1,
            highlight=True,
            description="Se crea evento C1 asociado a rebalse de lamas o aguas claras",
        ),
    )
