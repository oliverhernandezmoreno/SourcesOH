from functools import partial
from itertools import groupby
import logging
import math
import operator

from django.conf import settings
from django.utils.dateparse import parse_datetime
import elasticsearch_dsl as dsl

from targets.elastic.conn import search, msearch

logger = logging.getLogger(__name__)


def date_histogram(interval, timezone_offset):
    return dsl.A(
        "date_histogram",
        interval=interval,
        field="@timestamp",
        **(
            {"offset": "".join((
                "+" if timezone_offset > 0 else "-",
                str(abs(timezone_offset)),
                "m",
            ))}
            if timezone_offset is not None
            else {}
        ),
    )


def guess_interval_width(s, quantity):
    """Computes a reasonable interval width given a search and the
    expected quantity of intervals.

    """
    responses = msearch([
        s.sort("@timestamp").source(includes=["@timestamp"])[0:1],
        s.sort("-@timestamp").source(includes=["@timestamp"])[0:1],
    ])
    count = responses[0].count
    q = min(
        count,
        (
            settings.AGGREGATIONS_DEFAULT_INTERVAL_QUANTITY
            if not quantity or quantity <= 0
            else quantity
        )
    )
    timestamps = sorted(set(
        e["@timestamp"]
        for response in responses
        for e in response.hits
    ))
    if len(timestamps) != 2:
        # arbitrary: anything is good enough
        return "8h"
    try:
        start, end = map(parse_datetime, timestamps)
        assert start is not None and end is not None
    except (ValueError, AssertionError):
        logger.error(f"Couldn't parse datetime from elasticsearch: {list(timestamps)}")
        # panic, just return something
        return "8h"
    interval = (end - start) / q
    seconds = interval.total_seconds()
    if seconds == 0:
        return "1s"
    if seconds < 60:
        return f"{math.ceil(seconds)}s"
    minutes = seconds / 60
    if minutes < 60:
        return f"{math.ceil(minutes)}m"
    hours = minutes / 60
    if hours < 24:
        return f"{math.ceil(hours)}h"
    return f"{math.ceil(hours / 24)}d"


# The catalog of available aggregations
AGGREGATION_TYPES = {
    "max": None,
    "min": None,
    "last": None,
    "sample": None,
}


@partial(operator.setitem, AGGREGATION_TYPES, "max")
def max_aggregation(s, **opts):
    "Returns the single event with the maximum value for each interval."
    interval = opts.get("interval") or guess_interval_width(s, opts.get("intervals"))
    timezone_offset = opts.get("timezone_offset")
    s.aggs.bucket(
        "histogram",
        date_histogram(interval, timezone_offset),
    ).bucket(
        "max_value",
        dsl.A("max", field="value"),
    )
    for bucket in search(s).aggregations.get("histogram", {}).get("buckets", []):
        yield {
            "@timestamp": bucket["key_as_string"],
            "value": bucket["max_value"]["value"]
        }


@partial(operator.setitem, AGGREGATION_TYPES, "min")
def min_aggregation(s, **opts):
    "Returns the single event with the minimum value for each interval."
    interval = opts.get("interval") or guess_interval_width(s, opts.get("intervals"))
    timezone_offset = opts.get("timezone_offset")
    s.aggs.bucket(
        "histogram",
        date_histogram(interval, timezone_offset),
    ).bucket(
        "min_value",
        dsl.A("min", field="value"),
    )
    for bucket in search(s).aggregations.get("histogram", {}).get("buckets", []):
        yield {
            "@timestamp": bucket["key_as_string"],
            "value": bucket["min_value"]["value"]
        }


@partial(operator.setitem, AGGREGATION_TYPES, "last")
def last_aggregation(s, **opts):
    "Returns the single event with the latest timestamp for each interval."
    interval = opts.get("interval") or guess_interval_width(s, opts.get("intervals"))
    timezone_offset = opts.get("timezone_offset")
    s.aggs.bucket(
        "histogram",
        date_histogram(interval, timezone_offset),
    ).bucket(
        "last_value",
        dsl.A("top_hits", sort=[{"@timestamp": "desc"}], size=1),
    )
    for bucket in search(s).aggregations.get("histogram", {}).get("buckets", []):
        timestamp = bucket["key_as_string"]
        value = None
        if len(bucket["last_value"]["hits"]["hits"]) > 0:
            last_hit = bucket["last_value"]["hits"]["hits"][0]["_source"]
            timestamp = last_hit["@timestamp"]
            value = last_hit["value"]
        yield {
            "@timestamp": timestamp,
            "value": value
        }


@partial(operator.setitem, AGGREGATION_TYPES, "sample")
def sample_aggregation(s, **opts):
    """Returns a set of quintiles for each interval. Duplicate values are
    removed from the result, and the results are flattened into the
    main collection.

    """
    interval = opts.get("interval") or guess_interval_width(s, opts.get("intervals"))
    timezone_offset = opts.get("timezone_offset")
    s.aggs.bucket(
        "histogram",
        date_histogram(interval, timezone_offset),
    ).bucket(
        "sample",
        dsl.A("percentiles", field="value", percents=[0, 25, 50, 75, 100], keyed=False),
    )
    for bucket in search(s).aggregations.get("histogram", {}).get("buckets", []):
        for v, _ in groupby(percentile["value"] for percentile in bucket.get("sample", {}).get("values", [])):
            yield {
                "@timestamp": bucket["key_as_string"],
                "value": v
            }


def get_timeseries_aggregation(s, type_, **opts):
    "Executes the given aggregation according to *type_*"
    aggregation = AGGREGATION_TYPES.get(type_, None)
    if not aggregation:
        return None
    # ignore hits of query (set size to)
    s = s[:0]
    return list(aggregation(s, **opts))
