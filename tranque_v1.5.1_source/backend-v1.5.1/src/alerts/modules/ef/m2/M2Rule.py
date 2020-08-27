from alerts.modules.rules import Rule


class M2Rule(Rule):
    def save_active_events(self):
        return self.save_events(active_events=lambda event: event['value'] > 0)

    def save_worst_state(self):
        def action(ctx):
            worst_state = ''
            for timeseries, event in getattr(ctx, 'active_events', []):
                state = event['name'].split('.')[-1]
                if state > worst_state:
                    worst_state = state
            return worst_state

        return self.save(worst_state=action)

    def when_worst_state_is_higher(self):
        return self.when(lambda ctx: getattr(ctx, 'worst_state') > ctx.controller.ticket.state)
