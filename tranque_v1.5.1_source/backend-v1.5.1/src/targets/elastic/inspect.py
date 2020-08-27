"""This module exposes event inspection primitives.

"""
from targets.elastic.conn import search
from targets.elastic.query import Search
from targets.graphs import build_raw_graph


def get_event(variant):
    """Returns a base representation of an event given an ID."""
    if isinstance(variant, dict) and "dependencies" in variant:
        return variant
    if isinstance(variant, dict) and "_id" not in variant:
        return None
    id_ = variant["_id"] if isinstance(variant, dict) else variant
    hits = search(Search().filter_by_id(id_).source("*")[:1]).hits
    return None if not hits else hits[0]


def get_trace(variant, inputs_only=False):
    """Inflates the trace of a single event, given either as an ID or a
    full event. Returns an enriched representation of the event.

    """
    event = get_event(variant)
    if not event or "trace" in event:
        return event
    if not event.get("dependencies", []):
        return {
            **event,
            "trace": [],
        }
    s = Search().filter_by_id(event.get("dependencies")).source("*")
    count = search(s[:0]).count

    errors = {}
    if len(event.get("dependencies")) != count:
        errors["dependencies"] = ['one or more dependencies are missing']

    trace = search(s[:count]).hits

    if inputs_only:
        trace = [
            d
            for d in trace
            if len(d.get("dependencies", [])) == 0
        ]

    return {
        **event,
        "trace_errors": errors,
        "trace": trace
    }


def get_message(variant):
    """Inflates the message which produced a single event, given either as
    an ID or a full event. Returns an enriched representation of the
    event.

    """
    from targets.models import Timeseries
    event = get_event(variant)
    if not event or "message" in event:
        return event
    message_id = next(
        (
            label.get("value")
            for label in event.get("labels", [])
            if label.get("key") == "message-id"
        ),
        None,
    )
    if message_id is None:
        return {
            **event,
            "message": [],
        }
    s = Search().filter_by_message(message_id)
    timeseries = Timeseries.objects.filter(canonical_name=event["name"]).first()
    if timeseries is not None:
        collection, _ = build_raw_graph(timeseries, "inputs")
        s = s.filter_by_name([ts.canonical_name for ts in collection.values()])
    count = search(s[:0]).count
    return {
        **event,
        "message": search(s[:count]).hits,
    }


def get_coverage(variant):
    """Combines the inflated trace and message into a unified collection,
    called 'coverage'. Returns an enriched representation of the
    event.

    """
    event = get_message(get_trace(variant))
    if not event or "coverage" in event:
        return event
    return {
        **event,
        "coverage": {
            e.get("_id"): e
            for e in [
                *event.get("trace", []),
                *event.get("message", []),
            ]
        }.values(),
    }
