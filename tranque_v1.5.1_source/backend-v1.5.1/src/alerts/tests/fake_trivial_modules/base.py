from alerts.models import TicketComment
from alerts.modules import base
from alerts.modules.base_states import EVENT_STATES, NO_LEVEL
from alerts.modules.conditions import condition_children_closed
from alerts.modules.rules import Rule
from base.fields import StringEnum


class BaseTestController(base.BaseController):
    states = StringEnum(*EVENT_STATES)

    def get_level(self, ticket):
        if ticket.state_group == EVENT_STATES.A:
            return 1
        elif ticket.state_group == EVENT_STATES.B:
            return 2
        elif ticket.state_group == EVENT_STATES.C:
            return 3
        elif ticket.state_group == EVENT_STATES.D:
            return 4
        return NO_LEVEL

    def result_state(self, ticket):
        if ticket.state == self.CLOSED_STATE:
            return self.no_result
        return {
            "level": self.get_level(ticket),
            "short_message": self.name,
        }

    def close_conditions(self, ticket, ctx):
        return [
            condition_children_closed(ticket, ctx)
        ]

    def archive_conditions(self, ticket, ctx):
        return [
            {
                'description': 'Ticket has at least one comment',
                'complete': ticket.comments.exists()
            }
        ]

    def escalate_conditions(self, ticket, ctx):
        ret = {}
        # A can go to
        # - B if there is a comment
        if ticket.state == self.states.A:
            ret['B'] = [
                {
                    'description': 'Ticket has at least one event management comment',
                    'complete': ticket.comments.filter(comment_type=TicketComment.CommentType.EVENT_MANAGEMENT).exists()
                }
                # TODO add authorization condition
            ]
        # B and C can go to
        # - A if there is a comment
        # - D always
        if ticket.state == self.states.B or ticket.state == self.states.C:
            ret['A'] = [
                {
                    'description': 'Ticket has at least one comment',
                    'complete': ticket.comments.exists()
                },
            ]
            ret['D'] = [
                {
                    'description': 'Can\'t manually escalate to C',
                    'complete': True
                }
            ]
        # D can not go anywhere
        return ret

    create = Rule.assemble(
        # save PI
        Rule()
        .save_events(pi_events=lambda event: event["value"] == 3.1415)
        .stop(),

        # raise only if PI can be found
        Rule()
        .when_context_property("pi_events")
        .then_update_by_events(
            state=states.A,
            events_prop="pi_events",
            description=Rule.ActionDescription.CREATE
        ),
    )

    update = Rule.assemble(
        # save PI
        Rule()
        .save_events(pi_events=lambda event: event["value"] == 3.1415)
        .stop(),

        # raise to D if there are 3 PI events
        Rule()
        .when_context_property('pi_events')
        .when(lambda ctx: len(getattr(ctx, 'pi_events')) > 3)
        .then_update_by_events(
            state=states.D,
            events_prop="pi_events",
            description=Rule.ActionDescription.ESCALATE
        ),
    )

    # accept any update, conditions are checked before running this method
    update_by_intent = Rule.assemble(
        Rule("close")
        .when_attempts_closing()
        .then_update_by_intent(description=Rule.ActionDescription.CLOSE),

        Rule("escalate")
        .when_attempts_escalating()
        .then_update_by_intent(description=Rule.ActionDescription.ESCALATE),

        Rule("archive")
        .when_attempts_archiving(True)
        .then_update_by_intent(description=Rule.ActionDescription.ARCHIVE, next_archived=True),

        Rule("unarchive")
        .when_attempts_archiving(False)
        .then_update_by_intent(description=Rule.ActionDescription.ARCHIVE, next_archived=False),
    )
