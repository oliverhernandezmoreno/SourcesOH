import collections
import logging
import tempfile

from django.conf import settings
from django.core.files import File
from django.db import transaction
from django.db.models import Prefetch, Q
from django.utils import timezone

from alerts.collector import target_controllers, is_child, is_parent
from alerts.models import Ticket, UserIntent, AttendedEvent
from alerts.modules.base import BaseController
from alerts.modules.base_states import CONDITIONS_TYPES
from alerts.modules.rules import module_matches, Rule
from api.v1.handlers.alert_utils import prepare_ticket_message_body
from base.serializers import serialize_variant
from documents.models import Document
from remotes.dispatch import send_simple_message
from targets import elastic
from targets.models import AcquiredProtocol, Threshold, Timeseries

logger = logging.getLogger(__name__)


def _resolve_query(target, q, timestamp):
    """Resolves a query object into a list of timeseries objects.

    """
    active_thresholds = Threshold.objects.filter(active=True)
    active_acquired_protocols = AcquiredProtocol.objects.filter(active=True)
    timeseries = (
        Timeseries.objects
        .filter(target=target, active=True)
        .filter(Q(data_source__isnull=True) | Q(data_source__active=True))
        .filter(q.query)
        .select_related("data_source", "data_source_group")
        .prefetch_related(
            "frequencies",
            Prefetch("thresholds", active_thresholds, "_active_thresholds"),
            Prefetch("acquired_protocols", active_acquired_protocols, "_active_acquired_protocols"),
        )
    )
    searches = [
        (t.events_search() if q.only_in_range else t.unfiltered_events_search())
        .source("*")
        .filter_by_timestamp_range("lte", timestamp.isoformat())[:q.count]
        for t in timeseries
    ]
    responses = elastic.msearch(searches)
    for t, response in zip(timeseries, responses):
        # inject 'all_events' property to differentiate with events
        # already attended
        t._all_events = response.hits
    return timeseries


def setup(target, controllers, timestamp=None):
    """Query the databases' state and return a structure (tickets,
    timeseries, user intents). The queries should be directed by the
    given controllers, a mapping of controller module names to
    controller classes.

    """
    tickets = (
        Ticket.objects
        .filter(target=target, origin=settings.NAMESPACE)
        .exclude(state=Ticket.TicketState.CLOSED)
        .filter(module__in=list(controllers))
        .order_by("-created_at")
    )

    timeseries = [
        (name, ts)
        for name, controller in controllers.items()
        for query in controller.relevant_events
        for ts in _resolve_query(target, query, timestamp or timezone.now())
    ]

    # Anotate timeseries events according to those already attended
    for name, ts in timeseries:
        attended_collection = set(
            (ae.event_id, ae.event_version)
            for ae in AttendedEvent.objects.filter(module=name, target=target).iterator()
        )
        # inject property
        ts._events = [
            e for e in ts.all_events
            if (e.get("_id"), e.get("_version")) not in attended_collection
        ]
    intents = UserIntent.objects.filter(
        target=target,
        module__in=list(controllers),
        attended_at__isnull=True,
    )

    return tickets, timeseries, intents


def controllers_by_hints(target, hints=None):
    """Returns a dictionary of controllers from the given target.

    *hints*, if given, must be an iterable of module names which will
    filter controllers by exact match, parent or child relationship
    (directly or indirectly).
    """

    controllers = target_controllers(target)

    if not hints:
        return controllers
    return {
        module: controller
        for module, controller in controllers.items()
        if module in hints or
        any(is_child(controllers, module, h) for h in hints if h in controllers) or
        any(is_parent(controllers, module, h) for h in hints if h in controllers)
    }


def controllers_by_level(controllers):
    """Returns a list of controller classes keyed to their module names,
    each subsequent list being dependent on the previous ones.

    """
    pool = set(controllers)
    while pool:
        # select all those modules which don't have children in the pool
        to_remove = set(
            c
            for c in pool
            if not any(
                module_matches(pool_module, child)
                for pool_module in pool
                for child in controllers[c].children
            )
        )
        if not to_remove:
            raise RuntimeError(f"controllers form a loop! remaining in pool: {pool}")
        yield {c: controllers[c] for c in to_remove}
        pool = pool - to_remove


def _propagate_ticket(ticket):
    """Propagate tickets through the AMQP channel"""
    args = None
    if settings.STACK_IS_SML:
        args = {
            'exchange': settings.SMC_AMQP_EXCHANGE,
            'broker_url': settings.SMC_BROKER_URL
        }
    elif ticket.target.remote is not None:
        args = {'exchange': ticket.target.remote.exchange}
    else:
        logger.info(
            'Stack is configured as a SMC and ' +
            f'target {ticket.target.canonical_name} has no remote, ' +
            f'ticket {ticket.id} will not be propagated'
        )
    if args is not None:
        body = prepare_ticket_message_body(ticket)
        send_simple_message(command='alerts.ticket', body=body, **args)


def _update_conditions(ticket, controller_instance, timeseries, intent):
    context = Rule.Context(controller_instance, timeseries, intent)
    ticket.close_conditions = controller_instance.close_conditions(ticket, context)
    ticket.escalate_conditions = controller_instance.escalate_conditions(ticket, context)
    ticket.archive_conditions = controller_instance.archive_conditions(ticket, context)


def _clean_intent_conditions(ticket, controller_instance, action):
    controller_instance.cleanup_after_intent(ticket, action)


def _finalize_ticket(instance, ticket, logs, broadcast, timeseries, intent, dry, action):
    # Compute the resulting state of the ticket
    ticket.result_state = instance.result_state(ticket)
    # Compute whether the ticket should be propagated
    ticket.propagated = ticket.propagated or instance.should_propagate(ticket)
    # Clean up conditions
    if action:
        _clean_intent_conditions(ticket, instance, action)
    # Compute state of conditions
    _update_conditions(ticket, instance, timeseries, intent)
    # Get a posible public alert message
    ticket.public_alert_abstract = instance.public_alert_abstract(ticket)
    ticket.save()

    # Save all child tickets from the controller instance to the
    # children relation
    for child in instance.child_tickets:
        ticket.children.add(child)

    # Link logs to the ticket
    for log in (logs or []):
        log.ticket = ticket
        log.save()

    # Link broadcast to the ticket
    if broadcast:
        broadcast_object = instance.ticket_broadcast(ticket)
        broadcast_object.ticket = ticket
        broadcast_object.save()

    # Mark all unattended events as attended
    AttendedEvent.objects.filter(module=ticket.module, target=ticket.target).delete()
    AttendedEvent.objects.bulk_create([
        AttendedEvent(
            event_id=e["_id"],
            event_version=e["_version"],
            module=ticket.module,
            target=ticket.target,
        )
        for ts in timeseries
        for e in ts.all_events
    ])

    # Mark the intent as attended
    if intent:
        intent.attended_at = instance.timestamp
        intent.save()

    # propagate ticket if there are changes, it is not a dry-run and ticket should be propagated:
    if logs and not dry and ticket.propagated:
        _propagate_ticket(ticket)


def _run_controller(target, controller_instance, timeseries, intent, dry=False):
    """Run a single controller with the given timeseries and intent
    inputs.

    """
    # Perform the evaluability check
    ticket = controller_instance.ticket
    if ticket is not None:
        evaluable = controller_instance.is_evaluable()
        ticket.set_evaluable(evaluable)
        # skip ticket if it isn't evaluable
        if not evaluable:
            return None
        # update conditions before running
        _update_conditions(ticket, controller_instance, timeseries, intent)
        ticket.save()
    # Dispatch to controller logic
    result = BaseController.no_result

    if intent is not None:
        if ticket is None:
            result = controller_instance.create_by_intent(timeseries, intent)
        else:
            # check if conditions are completed
            result = controller_instance.check_conditions_rules(timeseries, intent)
            # if no_result then conditions are not complete
            if result is not BaseController.no_result:
                result = controller_instance.update_by_intent(timeseries, intent)
    if result is BaseController.no_result or result is None:
        result = (
            controller_instance.create(timeseries)
            if controller_instance.ticket is None
            else controller_instance.update(timeseries)
        )
    if result is not BaseController.no_result and result is not None:
        state, archived, logs, broadcast, action = result
        updated_ticket = (
            Ticket(
                target=target,
                module=controller_instance.module,
                spread_object=type(controller_instance).serialized_spread_object(),
                groups="/" + "/".join(controller_instance.visibility_groups) + "/",
            )
            if controller_instance.ticket is None
            else controller_instance.ticket
        )
        updated_ticket.state = state
        if archived is not None:
            updated_ticket.archived = archived
        updated_ticket.save()

        _finalize_ticket(controller_instance, updated_ticket, logs, broadcast, timeseries, intent, dry, action)
        return updated_ticket
    elif controller_instance.ticket is not None:
        _finalize_ticket(controller_instance, controller_instance.ticket, None, False, timeseries, intent, dry, None)
    return None


# A record of a controller's "dry run", a fake execution's result
DryRunIntent = collections.namedtuple("DryRunIntent", (
    "module",  # the controller's module this attempt was tergeting
    "state",  # the attempted state to be set by the dry run's intent
    "document",  # the presence of a document backing said intent (bool)
    "issue",  # the resulting issue of said dry run
))


class DryRunException(Exception):
    """An exception used to summarize an engine's dry run."""

    def __init__(self, tickets, intents):
        tickets = list(map(serialize_variant, tickets))
        intents = list(map(serialize_variant, intents))
        super().__init__(tickets, intents)
        self.tickets = tickets
        self.intents = intents

    def report_intents(self):
        for intent in self.intents:
            yield DryRunIntent(
                intent["module"],
                intent["content"]["state"],
                intent["content"]["document"] is not None,
                intent["issue"]
            )


@transaction.atomic
def run(target, hints=None, dry=False):
    """The main procedure. It coordinates the execution of the alerts
    sub-engine, returning the affected tickets for the given target.

    *hints*, if given, must be an iterable of module names that are
    _of interest_, meaning they're the focus of this engine's
    execution. They're used as filters for the controller hierarchy.

    *dry*, if True, makes this run() execution fail with a specialized
    exception, which contains a summary of the would-be results. The
    exception is raised to rollback the transaction and revert all
    changes performed by it.

    """

    logger.info(f"Starting alerts.engine.run() with hints {hints}")
    timestamp = timezone.now()
    affected = []
    intents = []
    hinted_controllers = controllers_by_hints(target, hints=hints)
    # set all tickets not reachable by controllers as "not evaluable"
    if not hints:
        unreachable = (
            Ticket.objects
            .filter(target=target, origin=settings.NAMESPACE)
            .exclude(state=Ticket.TicketState.CLOSED)
            .exclude(module__in=list(hinted_controllers))
        )
        for ticket in unreachable:
            ticket.set_evaluable(False)

    # collect controllers in levels
    for controllers in controllers_by_level(hinted_controllers):
        tickets, named_timeseries, all_intents = setup(target, controllers, timestamp)
        for name, controller in controllers.items():

            # Select each controller's inputs
            ticket_list = []
            for ticket in tickets:
                if ticket.module == name:
                    ticket_list.append(ticket)

            ticket = next(
                iter(ticket_list),
                None,
            )

            in_module_children = [
                c
                for c in hinted_controllers
                for child in controller.children
                if module_matches(c, child)
            ]

            child_tickets = (
                Ticket.objects
                .filter(target=target)
                .exclude(state=Ticket.TicketState.CLOSED)
                .filter(module__in=in_module_children)
            )

            timeseries = [t for n, t in named_timeseries if n == name]

            intent = next((
                i for i in all_intents
                if i.module == name
                if ("state" not in i.content and "archived" in i.content)
                or i.content["state"] == Ticket.TicketState.CLOSED
                or i.content["state"] in controller.states
            ), None)

            controller_instance = controller(
                ticket,
                list(filter(controller.is_child_ticket, child_tickets)),
                timestamp,
                target
            )

            t = _run_controller(target, controller_instance, timeseries, intent, dry)
            if t is not None:
                affected.append(t)
            if intent is not None:
                intents.append(intent)

    logger.info("Finished execution of alerts.engine.run()")
    if dry:
        raise DryRunException(affected, intents)
    return affected


def dry_run(target, hints=None):
    """Executes a dry run
    returns the resulting tickets and intents
    """
    try:
        run(target, hints=hints, dry=True)
        assert False, "dry run didn't raise exception"
    except DryRunException as e:
        tickets = e.tickets
        intents = e.intents
    return tickets, intents


def user_dry_runs(target, controller, ticket, user):
    """Executes a series of 'dry runs' with the given user attempting all
    possible state transitions (through intents) on the given
    controller and ticket.

    """
    combinations = (
        (state, document_presence)
        for state in [*controller.states, Ticket.TicketState.CLOSED]
        if ticket is None or state != ticket.state
        for document_presence in (True, False)
    )

    with tempfile.NamedTemporaryFile() as fake_file:
        fake_document = Document.objects.create(
            folder="fake",
            file=File(fake_file),
            name="fake",
            uploaded_by=user,
        )

    for (state, document_presence) in combinations:
        try:
            with transaction.atomic():
                UserIntent.objects.create(
                    target=target,
                    user=user,
                    module=controller.module,
                    content={
                        "state": state,
                        "document": None
                        if not document_presence
                        else fake_document.id
                    }
                )
                run(target, hints=[controller.module], dry=True)
        except DryRunException as e:
            for entry in e.report_intents():
                if entry.module == controller.module:
                    yield entry

    fake_document.delete()


@transaction.atomic
def update_ticket_conditions(ticket):
    # this function is a hack to reduce response time of api requests
    # related to ticket authorizations and ticket comments
    # it will update conditions with type in ["authorization", "type"]
    # because they do not depend on context (events or tickets)
    # so it should be safe to update them without running the engine

    logger.info(f"Evaluating {ticket.id} conditions")
    timestamp = timezone.now()
    controller = target_controllers(ticket.target).get(ticket.module, None)
    if controller is None:
        return
    ticket_copy = Ticket.objects.get(id=ticket.id)
    controller_instance = controller(
        ticket_copy,
        [],
        timestamp,
        ticket.target
    )

    _update_conditions(ticket_copy, controller_instance, [], None)

    def _replace_conditions(get_ticket_conditions):
        conditions = []
        original_conditions = get_ticket_conditions(ticket)
        copy_conditions = get_ticket_conditions(ticket_copy)
        assert len(original_conditions) == len(copy_conditions)
        for original_con, copy_con in zip(original_conditions, copy_conditions):
            assert original_con['description'] == copy_con['description']
            conditions.append((
                copy_con
                if copy_con.get('type', None) in [CONDITIONS_TYPES.authorization, CONDITIONS_TYPES.comment]
                else original_con
            ))
        return conditions

    ticket.close_conditions = _replace_conditions(lambda t: t.close_conditions)
    ticket.archive_conditions = _replace_conditions(lambda t: t.archive_conditions)
    escalate_conditions = {}
    for key in ticket.escalate_conditions:
        escalate_conditions[key] = _replace_conditions(lambda t: t.escalate_conditions[key])
    ticket.escalate_conditions = escalate_conditions
    ticket.save()
