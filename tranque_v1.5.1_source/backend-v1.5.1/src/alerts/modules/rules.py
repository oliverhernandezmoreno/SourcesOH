import inspect
import logging
import re

from django.conf import settings

from alerts.models import TicketLog, Ticket
from alerts.modules.base_states import ALERT_STATES
from alerts.modules.conditions import requires_condition
from api.v1.handlers.utils import get_dependencies_events
from api.v1.serializers.target_serializers import TimeseriesMessageSerializer
from targets.models import Timeseries


logger = logging.getLogger(__name__)


def module_matches(name, pattern):
    wildcard = pattern.endswith('*')
    head = pattern[0]
    tail = pattern[1:-1 if wildcard else None]
    regexp = "".join((
        "^",
        head.replace("*", r"(_|(\w+\(.*\)))"),
        tail.replace(".", r"\."),
        "" if wildcard else "$",
    ))
    return re.match(regexp, name) is not None


def group_by(keyfn, mapfn, collection):
    groups = {}
    for e in collection:
        key = keyfn(e)
        groups[key] = [*groups.get(key, []), mapfn(e)]
    return groups


def get_unmet_condition_issue(conditions):
    unmet = next(c for c in conditions if not c['complete'])
    return unmet['issue'] if 'issue' in unmet else None


# returns True if any condition is not complete
# not_conditions=False means all conditions are completed
def not_conditions(conditions):
    return any(not c['complete'] for c in conditions)


def not_close_conditions(ctx):
    return not_conditions(ctx.controller.ticket.close_conditions)


def not_archive_conditions(ctx):
    return not_conditions(ctx.controller.ticket.archive_conditions)


def not_escalate_conditions(ctx):
    new_state = ctx.intent.content.get('state', None)
    conditions = ctx.controller.ticket.escalate_conditions
    if new_state is not None and new_state in conditions:
        return not_conditions([
            cond
            for cond in conditions[new_state]
            if requires_condition(cond, ctx.intent.user)
        ])
    else:
        return True


class Rule:
    """An alternate object used to ease the writing of complex rules
    within the create_by_intent(), create(), update_by_intent() and
    update() methods.

    """

    class ActionDescription:
        CREATE = "create"
        CLOSE = "close"
        ESCALATE = "escalate"
        ARCHIVE = "archive"
        REQUEST = "request"
        AUTHORIZATION = "authorization"
        NEW_EVENTS = "new_events"

    class Context:
        def __init__(self, controller, timeseries, intent):
            self.controller = controller
            self.timeseries = timeseries
            self.events = [(ts, event) for ts in timeseries for event in ts.events]
            self.all_events = [(ts, event) for ts in timeseries for event in ts.events]
            self.intent = intent
            self._lazy = {}
            self._lazy_cache = {}

        def set_lazy(self, lazy):
            self._lazy = {**self._lazy, **lazy}
            cache = self._lazy_cache
            for k in lazy:
                if k in cache:
                    del cache[k]

        def __getattr__(self, k):
            lazy = self._lazy
            cache = self._lazy_cache
            if k not in cache:
                if k not in lazy:
                    raise AttributeError(f"{k} is not a valid context property")
                cache[k] = lazy[k](self)
            return cache[k]

    def __init__(self, name=None, saves=None, predicates=None, action=None):
        super().__setattr__("name", name or "anonymous rule")
        super().__setattr__("saves", saves or {})
        super().__setattr__("predicates", predicates or [])
        super().__setattr__("action", action)

    def __str__(self):
        return f"Rule({repr(self.name)})"

    def __setattr__(self, k, v):
        raise TypeError("immutable!")

    def save(self, **kwargs):
        return type(self)(self.name, {**self.saves, **kwargs}, self.predicates, self.action)

    def when(self, predicate):
        return type(self)(self.name, self.saves, [*self.predicates, predicate], self.action)

    def never(self):
        return self.when(lambda ctx: False)

    stop = never

    def then(self, action):
        if self.action is not None:
            logger.warning(f"rule {self} already has a defined action")
        return type(self)(self.name, self.saves, self.predicates, action)

    @staticmethod
    def assemble(*rules):
        def assembled(self, timeseries, *other):
            intent = next(iter(other), None)
            # The context is execution-global
            context = Rule.Context(self, timeseries, intent)
            for rule in rules:
                # each rule may set lazy attributes on the context,
                # which are available for all other rules.
                context.set_lazy(rule.saves)
                if all(predicate(context) for predicate in rule.predicates):
                    if rule.action:
                        return rule.action(context)
                    return self.no_result
            return self.no_result

        assembled.__doc__ = "\n".join(map(str, rules))
        return assembled

    # common saves

    def save_events(self, **kwargs):
        over = kwargs.pop("over", "events")

        def wrap_varargs(f):
            "Emulate the generous variadic behaviour of JS functions."
            signature = inspect.signature(f)
            event, timeseries, timestamp = (object(), object(), object())
            try:
                signature.bind(event, timeseries, timestamp)
                return f
            except TypeError:
                pass
            try:
                signature.bind(event, timeseries)
                return lambda event, timeseries, _: f(event, timeseries)
            except TypeError:
                return lambda event, _, __: f(event)

        wrapped_kwargs = {k: wrap_varargs(f) for k, f in kwargs.items()}
        return self.save(**{k: lambda ctx: [
            (timeseries, event)
            for timeseries, event in getattr(ctx, over)
            if predicate(event, timeseries, ctx.controller.timestamp)
        ] for k, predicate in wrapped_kwargs.items()})

    # common predicates

    def when_attempts_closing(self):
        return self.when(lambda ctx: ctx.intent.attempts_closing())

    def when_attempts_archiving(self, archived):
        return self.when(lambda ctx: ctx.intent.attempts_archive_update(archived))

    def when_attempts_escalating(self):
        def predicate(ctx):
            current_state = ctx.controller.ticket.state if ctx.controller.ticket is not None else None
            return ctx.intent.attempts_state_update(current_state)

        return self.when(predicate)

    def when_user_is_authority(self):
        return self.when(lambda ctx: ctx.intent.user_is_authority)

    def when_user_is_mine(self):
        return self.when(lambda ctx: ctx.intent.user_is_mine)

    def when_user_belongs_to_group(self, g):
        return self.when(lambda ctx: ctx.intent.user.groups.filter(name=g).exists())

    def when_ticket_state(self, state):
        return self.when(lambda ctx: ctx.controller.ticket.state == state)

    def when_intent_state(self, state):
        return self.when(lambda ctx: ctx.intent.content["state"] == state)

    def when_intent_document(self):
        return self.when(lambda ctx: ctx.intent.document is not None)

    def when_any_child(self):
        return self.when(lambda ctx: bool(ctx.controller.child_tickets))

    def when_stack_is_sml(self):
        def check(ctx):
            return settings.STACK_IS_SML

        return self.when(check)

    def when_stack_is_smc(self):
        def check(ctx):
            return not settings.STACK_IS_SML

        return self.when(check)

    def when_not_close_conditions(self):
        return self.when(not_close_conditions)

    def when_not_archive_conditions(self):
        return self.when(not_archive_conditions)

    def when_not_escalate_conditions(self):
        return self.when(not_escalate_conditions)

    def when_one_child(self, child_module):
        return self.when(lambda ctx: bool([
            child
            for child in ctx.controller.child_tickets
            if module_matches(child.module, child_module)
        ]))

    def when_one_child_in_state(self, child_module, state):
        return self.when(lambda ctx: bool([
            child
            for child in ctx.controller.child_tickets
            if module_matches(child.module, child_module)
            if child.state == state
        ]))

    def when_one_event(self, predicate, prop="events"):
        return self.when(lambda ctx: any(
            predicate(timeseries, event)
            for timeseries, event in getattr(ctx, prop, [])
        ))

    def when_one_event_timestamp(self, predicate, prop="events"):
        return self.when(lambda ctx: any(
            predicate(timeseries, event, ctx.controller.timestamp)
            for timeseries, event in getattr(ctx, prop, [])
        ))

    def when_context_property(self, prop):
        return self.when(lambda ctx: bool(getattr(ctx, prop, False)))

    # common actions

    def then_issue(self, issue_option):
        def setissue(ctx):
            ctx.intent.setissue(issue_option)
            return ctx.controller.no_result

        return self.then(lambda ctx: setissue(ctx))

    def then_issue_from_ctx(self, **meta):
        prop = meta.pop("prop", "issue")
        default = meta.pop("default", None)

        def setissue(ctx):
            issue = getattr(ctx, prop) if getattr(ctx, prop) is not None else default
            ctx.intent.setissue(issue)
            return ctx.controller.no_result

        return self.then(lambda ctx: setissue(ctx))

    def save_condition_issue(self, conditions_prop):
        def get_issue(ctx):
            conditions = getattr(ctx.controller.ticket, conditions_prop, [])
            if isinstance(conditions, dict):
                target_state = ctx.intent.content.get("state", None) if ctx.intent is not None else None
                if target_state in conditions:
                    return get_unmet_condition_issue(conditions[target_state])
                else:
                    return 'BLOCKED_BY_RULES'
            else:
                return get_unmet_condition_issue(conditions)

        return self.save(issue=get_issue)

    def then_no_result(self):
        return self.then(lambda ctx: ctx.controller.no_result)

    def then_update_by_intent(self, **meta):
        highlight = meta.pop("highlight", False)
        broadcast = meta.pop("broadcast", False)
        state = meta.pop("state", None)
        _archived = meta.pop("archived", None)

        def action(ctx):
            ticket = ctx.controller.ticket
            # state update
            target_state = None
            if state is not None:
                target_state = state
            elif "state" in ctx.intent.content:
                target_state = ctx.intent.content["state"]
            if target_state is not None:
                _from_state = ticket.state if ticket is not None else '_'
                from_state = _from_state if _from_state in ALERT_STATES else _from_state[0]
                _action = "close" if target_state == Ticket.TicketState.CLOSED else "escalate"
                _to_state = target_state if target_state in ALERT_STATES else target_state[0]
                to_state = f'.{_to_state}' if _action == "escalate" else ''
                return ctx.controller.result(
                    target_state,
                    logs=[ctx.intent.as_log(
                        highlight=highlight,
                        meta={**meta, **TicketLog.state_transition(ctx.controller.ticket, target_state)},
                    )],
                    broadcast=broadcast,
                    action=f'ticket.{from_state}.{_action}{to_state}'
                )
            # archived update
            archived = _archived
            if archived is None and "archived" in ctx.intent.content:
                archived = ctx.intent.content["archived"]
            if archived is not None:
                return ctx.controller.result(
                    ctx.controller.ticket.state,
                    archived=archived,
                    logs=[ctx.intent.as_log(
                        highlight=highlight,
                        meta={**meta},
                    )],
                    broadcast=broadcast,
                    action=f'ticket.{ticket.state if ticket is not None else None}.archive'
                )
            # if not state or archive update, return no_result
            return ctx.controller.no_result

        return self.then(action)

    def then_close_by_intent(self, **meta):
        highlight = meta.pop("highlight", True)
        broadcast = meta.pop("broadcast", False)
        return self.then(lambda ctx: ctx.controller.result(
            ctx.controller.CLOSED_STATE,
            logs=[ctx.intent.as_log(
                highlight=highlight,
                meta={**meta, **TicketLog.state_transition(ctx.controller.ticket, ctx.controller.CLOSED_STATE)},
            )],
            broadcast=broadcast,
        ))

    def then_log_by_intent(self, **meta):
        highlight = meta.pop("highlight", False)
        broadcast = meta.pop("broadcast", False)
        return self.then(lambda ctx: ctx.controller.result(
            ctx.controller.ticket.state,
            logs=[ctx.intent.as_log(highlight=highlight, meta=meta)],
            broadcast=broadcast,
        ))

    def then_update_by_events(self, **meta):
        highlight = meta.pop("highlight", False)
        broadcast = meta.pop("broadcast", False)
        events_prop = meta.pop("prop", "events")
        state = meta.pop("state", None)
        state_prop = meta.pop("state_prop", None)

        def action(ctx):
            if state is not None:
                target_state = state
            elif state_prop is not None and getattr(ctx, state_prop) is not None:
                target_state = getattr(ctx, state_prop)
            else:
                target_state = ctx.controller.ticket.state
            timeseries = [
                {
                    **TimeseriesMessageSerializer(ts).data,
                    'events': [e['_id'] for e in events]
                }
                for ts, events in group_by(
                    lambda pair: pair[0],
                    lambda pair: pair[1],
                    getattr(ctx, events_prop),
                ).items()
            ]
            dependencies = get_dependencies_events(x[1] for x in getattr(ctx, events_prop, []))
            dependencies_ts = Timeseries.objects.filter(canonical_name__in=set(e['name'] for e in dependencies))
            timeseries.extend(
                {
                    **TimeseriesMessageSerializer(ts).data,
                    'events': [e['_id'] for e in dependencies if e['name'] == ts.canonical_name]
                } for ts in dependencies_ts
            )

            return ctx.controller.result(
                target_state,
                logs=[
                    TicketLog(
                        highlight=highlight,
                        timeseries=timeseries,
                        meta={
                            **meta,
                            **TicketLog.state_transition(ctx.controller.ticket, target_state),
                        },
                    )
                ],
                broadcast=broadcast,
            )

        return self.then(action)

    def then_update_by_children(self, **meta):
        state = meta.pop("state", None)
        state_prop = meta.pop("state_prop", None)
        children_prop = meta.pop("children_prop", None)

        def action(ctx):
            children = ctx.controller.child_tickets if children_prop is None else getattr(ctx, children_prop)
            if state is not None:
                target_state = state
            elif state_prop is not None and getattr(ctx, state_prop) is not None:
                target_state = getattr(ctx, state_prop)
            else:
                target_state = ctx.controller.ticket.state
            return ctx.controller.result(
                target_state,
                logs=[
                    TicketLog(
                        meta={
                            **meta,
                            **TicketLog.state_transition(ctx.controller.ticket, target_state),
                            'tickets': [child.id for child in children]
                        },
                    )
                ],
            )

        return self.then(action)

    # log for debugging
    def log(self, *ctx_props):
        def _log(ctx):
            for prop in ctx_props:
                logger.debug(f'{prop}: {str(getattr(ctx, prop, None))}')
            return True

        return self.when(_log)
