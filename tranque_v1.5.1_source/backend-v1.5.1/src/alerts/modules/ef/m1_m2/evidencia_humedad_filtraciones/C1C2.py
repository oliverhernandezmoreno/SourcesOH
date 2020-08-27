from alerts.modules.rules import Rule
from alerts.spreads import spread_sectors
from alerts.modules.base_states import EVENT_STATES
from base.fields import StringEnum
from alerts.modules.ef.m1_m2.evidencia_humedad_filtraciones.base import EvidenciaHumedadFiltracionesController


@spread_sectors()
class Controller(EvidenciaHumedadFiltracionesController):
    states = StringEnum(*EVENT_STATES, 'C1', 'C2')

    _relevant_events = ['C1', 'C2']

    children = StringEnum(
        FILTRACIONES_HUMEDAD="_.ef.m1_m2.evidencia_humedad_filtraciones.B1",
    )

    create = Rule.assemble(
        Rule("save activation evidence")
        .save_events(C1_events=lambda e: e["value"] > 0 and e["name"].endswith("C1"))
        .save_events(C2_events=lambda e: e["value"] > 0 and e["name"].endswith("C2"))
        .save_events(raise_events=lambda e: e["value"] > 0)
        .stop(),

        Rule("activate automatically on trigger evidence")
        .when_context_property("C2_events")
        .then_update_by_events(
            events_prop="raise_events",
            state=states.C2,
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
        .save_events(C2_events=lambda e: e["value"] > 0 and e["name"].endswith("C2"))
        .when_context_property("C2_events")
        .save_events(raise_events=lambda e: e["value"] > 0)
        .then_update_by_events(
            events_prop="raise_events",
            state=states.C2,
            highlight=True,
            description=Rule.ActionDescription.ESCALATE,
        ),
    )
