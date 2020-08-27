import datetime
import logging
import time

import producer
import settings

logger = logging.getLogger(__name__)


def now():
    return datetime.datetime.utcnow().timestamp()


def make_regular_schedule(start, delta):
    """Builds a schedule for a job every N seconds, forever"""
    current = start
    while True:
        yield current
        current += delta


def minimum_with(f, col):
    """This is used to give priority to jobs ignored the longest"""
    paired = [(e, f(e)) for e in col]
    minimum = paired[0]
    for min_element, min_key in paired[1:]:
        if min_key < minimum[1]:
            minimum = (min_element, min_key)
    return minimum


# A constant used to represent an empty iterator
EMPTY = object()


def peek(iterable):
    """Turn an iterable into a (head, tail) pair"""
    it = iter(iterable)
    try:
        head = next(it)
        return (head, it)
    except StopIteration:
        return EMPTY


def strip_obsolete(timestamp, peeked):
    """Strip scheduled executions that are already in the past"""
    if peeked is EMPTY:
        return peeked
    if peeked[0] - timestamp <= 0:
        return strip_obsolete(timestamp, peek(peeked[1]))
    return peeked


def execute_schedules(job_schedule, *job_schedules, **opts):
    """Attend to all schedules provided, blocking when nothing is to be
    done. Each *job_schedule* is a pair of (callable, schedule). A
    schedule is a possibly infinite iterable of timestamps.

    """
    minimum_sleep_period = opts.get("minimum_sleep_period", 30)
    states = [
        {"job": job, "schedule": peek(schedule)}
        for job, schedule in [job_schedule, *job_schedules]
    ]
    while not all(state["schedule"] is EMPTY for state in states):
        timestamp = now()
        earliest_job, earliest_time = minimum_with(
            lambda state: state["schedule"][0] - timestamp,
            filter(lambda state: state["schedule"] is not EMPTY, states),
        )
        if earliest_time > 0:
            sleep_period = min(earliest_time, minimum_sleep_period)
            logger.debug(f"Sleeping for {sleep_period} out of {earliest_time} seconds")
            time.sleep(sleep_period)
        else:
            earliest_job["job"]()
            earliest_job["schedule"] = strip_obsolete(
                now(),
                earliest_job["schedule"],
            )


def start():
    """Starts the schedule"""
    def wrap_cycle(fn):
        def wrapped():
            try:
                fn()
            except producer.PollError as e:
                logger.exception(f"Error during poll cycle: {e}")
        return wrapped

    p = producer.Producer()
    t0 = now()
    execute_schedules(
        (wrap_cycle(p.poll_cycle),
         make_regular_schedule(t0, settings.POLL_INTERVAL)),
        (wrap_cycle(p.heartbeat_cycle),
         make_regular_schedule(t0, settings.HEARTBEAT_INTERVAL)),
    )
