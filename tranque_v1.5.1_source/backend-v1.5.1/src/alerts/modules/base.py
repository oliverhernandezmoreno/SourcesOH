import collections
import functools
import inspect
import logging

from alerts.models import Ticket, Broadcast
from alerts.modules.conditions import condition_never
from alerts.modules.rules import Rule
from base.fields import StringEnum
from base.serializers import serialize_variant
from targets.models import DataSource, DataSourceGroup, Timeseries
from targets.profiling import get_nodes_by
from targets.profiling.base import N, serialize_node

logger = logging.getLogger(__name__)

EventQuery = collections.namedtuple("EventQuery", ("query", "count", "only_in_range"))


def event_query(query, count=None, only_in_range=True):
    return EventQuery(
        query=query,
        count=count if count is not None else 1,
        only_in_range=only_in_range,
    )


class BaseController:
    Result = collections.namedtuple("Result", ("state", "archived", "logs", "broadcast", "action"))

    # A marker for a no-op
    no_result = {
        "level": Ticket.TicketLevel.NO_LEVEL,
        "short_message": f'no level'
    }
    no_result_state = Ticket.empty_result_state

    def __init__(self, ticket, child_tickets, timestamp, target):
        # Write once the read-only attributes
        super().__setattr__("ticket", ticket)
        super().__setattr__("child_tickets", child_tickets)
        super().__setattr__("timestamp", timestamp)
        super().__setattr__("target", target)

    def __setattr__(self, k, v):
        raise TypeError("Controller attributes are read-only")

    # This attribute is automatically set by the collector
    module = None

    # This attribute is automatically set by the spread
    # (model, field_value, target_pk)
    spread_term = (None, None, None)

    @classmethod
    def spread_object(cls):
        """Returns the spread object or None, if no spreading applies.

        """
        model, value, target = cls.spread_term
        if model is None:
            return None
        return spread_model_catalog[model].getter(value, target)

    @classmethod
    def serialized_spread_object(cls):
        """Returns a serialized representation of the spread object or None,
        if no spreading applies.

        """
        obj = cls.spread_object()
        if obj is None:
            return None
        return spread_model_catalog[cls.spread_term[0]].serializer(obj)

    # Set a proper name for this ticket family
    name = ""

    # Set a proper description for this ticket family
    description = ""

    # Override with custom states
    states = StringEnum()
    CLOSED_STATE = Ticket.TicketState.CLOSED

    # Override with names of child controllers
    children = ()

    # This attribute is automatically set by the collector
    child_modules = ()

    # This attribute is automatically set by the collector
    parent_modules = ()

    # Assign string keys to make it visible for said groups
    visibility_groups = ()

    # Override with custom event queries, using the event_query()
    # method. For example:
    #     relevant_events = [
    #         event_query(Q(canonical_name="foo"), count=10),
    #         event_query(Q(canonical_name="bar"), count=2),
    #     ]

    event_query = staticmethod(event_query)

    relevant_events = []

    def should_propagate(self, ticket):
        """Defines whether a tickets should be propagated through the AMQP channel"""
        return False

    def are_events_normalized(self, ticket, events):
        """Override with custom implementation of normalization conditions of ticket events."""
        return True

    @classmethod
    def is_child_ticket(cls, ticket):
        "Defines whether a given child ticket is in fact a child."
        # By default, any ticket from children controllers is a child
        return True

    @staticmethod
    def is_family(ticket, *families):
        return any(ticket.state.startswith(family) for family in families)

    def is_evaluable(self):
        "Override with custom implementation of evaluable tickets"
        return True

    def ticket_broadcast(self, ticket):
        "Creation of a proper broadcast object for the given ticket."
        # Override
        return Broadcast(handlers=[{"name": "default"}])

    def result_state(self, ticket):
        """Override with custom implementation of a result state for the
        ticket.

        """
        return self.no_result_state

    def get_level(self, ticket):
        """Override with custom implementation of a state for the ticket."""
        return Ticket.TicketLevel.NO_LEVEL

    def result(self, state, archived=None, logs=None, broadcast=False, action=None):
        assert state == Ticket.TicketState.CLOSED or state in self.states, \
            f"invalid state {state} for controller '{self.name}'"
        return self.Result(state=state, archived=archived, logs=logs, broadcast=broadcast, action=action)

    def create_by_intent(self, timeseries, intent):
        """Execute this controller's logic for the creation of a new ticket
        through a user intent. Return a result as in self.result(), or
        self.no_result if nothing is to be created.

        """
        return self.no_result

    def create(self, timeseries):
        """Execute this controller's logic for the creation of a new
        ticket. Return a result as in self.result(), or self.no_result
        if nothing is to be created.

        """
        return self.no_result

    def update_by_intent(self, timeseries, intent):
        """Execute this controller's logic for the update of an existing
        ticket through a user intent. Return a result as in
        self.result(), or self.no_result if nothing is to be done to
        the ticket.

        """
        return self.no_result

    def update(self, timeseries):
        """Execute this controller's logic for the update of an existing
        ticket. Return a result as in self.result(), or self.no_result
        if nothing is to be done to the ticket.

        """
        return self.no_result

    def close_conditions(self, ticket, ctx):
        """Override with custom implementation of close conditions for the ticket.
        by default never accepts closing
        """
        return [condition_never]

    def archive_conditions(self, ticket, ctx):
        """Override with custom implementation of archive conditions for the ticket.
        by default never accepts archiving
        """
        return [condition_never]

    def escalate_conditions(self, ticket, ctx):
        """Override with custom implementation of escalate conditions for the ticket.
        by default never accepts escalating
        """
        return {}

    def cleanup_after_intent(self, ticket, intent):
        """Override with custom implementation of clean up after a ticket is attended successfully.
        """
        pass

    def public_alert_abstract(self, ticket):
        """Override with custom implementation of public abstract for the alert ticket.
        by default return an empty message
        """
        return ''

    check_conditions_rules = Rule.assemble(
        # block if the user attempts closing but closing conditions are not completed
        Rule()
        .when_attempts_closing()
        .when_not_close_conditions()
        .save_condition_issue("close_conditions")
        .then_issue_from_ctx(default="UNMET_CONDITIONS"),

        # block if the user attempts archiving but archiving conditions are not completed
        Rule()
        .when_attempts_archiving(True)
        .when_not_archive_conditions()
        .save_condition_issue("archive_conditions")
        .then_issue_from_ctx(default="UNMET_CONDITIONS"),

        # block if the user attempts escalating but escalating conditions are not completed
        Rule()
        .when_attempts_escalating()
        .when_not_escalate_conditions()
        .save_condition_issue("escalate_conditions")
        .then_issue_from_ctx(default="UNMET_CONDITIONS"),

        # Return something different than BaseController.no_result
        Rule().then(lambda ctx: None)
    )


SpreadSpec = collections.namedtuple("SpreadSpec", ("field", "prefix", "getter", "serializer"))
# model -> SpreadSpec(unique field, prefix, getter, serializer)
spread_model_catalog = {
    DataSource: SpreadSpec(
        "hardware_id",
        "s",
        (lambda v, target: DataSource.objects.filter(target=target, hardware_id=v).first()),
        serialize_variant,
    ),
    DataSourceGroup: SpreadSpec(
        "canonical_name",
        "g",
        (lambda v, target: DataSourceGroup.objects.filter(target=target, canonical_name=v).first()),
        serialize_variant,
    ),
    Timeseries: SpreadSpec(
        "canonical_name",
        "t",
        (lambda v, target: Timeseries.objects.filter(target=target, canonical_name=v).first()),
        serialize_variant,
    ),
    N: SpreadSpec(
        "value.canonical_name",
        "n",
        (lambda v, target: next(iter(get_nodes_by("canonical_name", v)), None)),
        serialize_node,
    ),
}


def spread(spread_model, spread_query):
    """Defines a controller factory given a spread criterion.

    A controller factory is a function that generates controllers
    given the passed class (which is used as a template) from the
    results of the spread criterion applied to a specific target. The
    class will be given a *spread_term* attribute, a tuple of (model,
    primary key) that can be used to identify the spread term in the
    database.

    The spread criterion is a pair of (model, query object) that gets
    translated into a queryset that the spread is done over.

    """
    assert spread_model in spread_model_catalog, f"model {spread_model} is not allowed for spreading"

    def wrapper(class_):
        assert issubclass(class_, BaseController), f"{class_} is not a subclass of BaseController"

        def from_target(target):
            spread_queryset = (
                spread_query(target)
                if inspect.isroutine(spread_query)
                else spread_model.objects.filter(target=target).filter(spread_query)
            )
            return [
                type(
                    "Controller",
                    (class_,),
                    {"spread_term": (
                        spread_model,
                        functools.reduce(
                            lambda obj, field: getattr(obj, field, None),
                            spread_model_catalog[spread_model][0].split("."),
                            s,
                        ),
                        target.pk,
                    )},
                )
                for s in spread_queryset
            ]

        from_target.controller_template = class_
        from_target.controller_factory = True
        return from_target

    return wrapper
