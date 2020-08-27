from django.db.models import Q

from alerts.tests.fake_trivial_modules.base import BaseTestController


class Controller(BaseTestController):
    children = ("*.foo",)

    relevant_events = [
        BaseTestController.event_query(Q(canonical_name__startswith="lorem-test-")),
    ]

    visibility_groups = ("loremipsum",)

    def escalate_conditions(self, ticket, ctx):
        ret = super().escalate_conditions(ticket, ctx)
        if ticket.state == self.states.A:
            # remove requirements to escalate to B from A
            ret['B'] = []
        return ret
