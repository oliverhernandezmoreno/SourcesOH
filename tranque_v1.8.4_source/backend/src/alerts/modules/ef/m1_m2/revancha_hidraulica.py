from django.db.models import Q
from django.utils.decorators import classproperty
from alerts.modules.ef.ef_event import EFEventController
from alerts.modules.rules import Rule
from alerts.modules.base_states import EVENT_STATES
from alerts.modules.event_types import CRITICAL_PARAMETERS, TOPOGRAPHY
from base.fields import StringEnum


PROFILE_DESCRIPTIONS = {
    'B1': 'Se detecta que la revancha hidráulica es menor que el primer valor umbral definido para una \
    operación normal.\n\n\
    Recomendación: Verificar el evento descrito e informar al superior a cargo. Además, el responsable del \
    depósito por parte de la Compañía Minera debe verificar el estado de los escenarios de falla de \
    rebalse RE-01, RE-02.',

    'B2': 'Se detecta que la revancha hidráulica es menor que el segundo valor umbral definido por la \
    autoridad.\n\n\
    Recomendación: Verificar el evento descrito e informar al superior a cargo. Además, el responsable del \
    depósito por parte de la Compañía Minera debe verificar el estado del escenario de falla de rebalse RE-02.',

    'B3': 'Se detecta que la revancha hidráulica es menor que el tercer valor umbral definido por diseño.\n\n\
    Recomendación: Verificar el evento descrito e informar al superior a cargo. Además, el responsable del \
    depósito por parte de la Compañía Minera debe verificar el estado del escenario de falla de rebalse RE-02.',
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
            "event_type": CRITICAL_PARAMETERS,
            "parameter": TOPOGRAPHY
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
