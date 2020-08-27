from alerts.modules.ef.ef_event import EFEventController
from alerts.modules.ef.m2.M2Rule import M2Rule


class M2BaseController(EFEventController):
    visibility_groups = (
        'ef',
        'ef.m2',
        'mine',
        'authority',
    )

    def are_events_normalized(self, ticket, events):
        return all(e[1]['value'] == 0 for e in events)

    create = M2Rule.assemble(
        M2Rule('activate automatically when an event is > 0')
        .save_active_events()
        .when_context_property('active_events')
        .save_worst_state()
        .then_update_by_events(
            state_prop='worst_state',
            description=M2Rule.ActionDescription.CREATE,
        )
    )

    update = M2Rule.assemble(
        M2Rule('save active events')
        .save_active_events()
        .save_worst_state()
        .stop(),

        M2Rule('auto escalate')
        .when_context_property('worst_state')
        .when_worst_state_is_higher()
        .then_update_by_events(
            state_prop='worst_state',
            description=M2Rule.ActionDescription.ESCALATE
        ),

        M2Rule('log new related events')
        .when_context_property('active_events')
        .then_update_by_events(
            description=M2Rule.ActionDescription.NEW_EVENTS
        )
    )
