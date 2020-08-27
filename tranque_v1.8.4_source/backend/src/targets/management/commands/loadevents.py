from contextlib import contextmanager
import itertools as it
import json
from pathlib import Path
import re
import sys
import time

from django.conf import settings
from django.core.management.base import BaseCommand
from django.utils.dateparse import parse_datetime

from targets.elastic import bulk_index
from targets.queue import dispatch


@contextmanager
def nullcontext(thing):
    yield thing


class Command(BaseCommand):
    help = """Loads the events provided into elasticsearch, and dispatches the
    corresponding message to rabbitmq."""

    GROUPINGS = {
        "all",
        "month",
        "week",
        "day",
        "hour",
        "minute",
    }

    is_space = (lambda m: (lambda _, s: m(s) is not None))(re.compile(r"\s").match)
    is_quote = (lambda m: (lambda _, s: m(s) is not None))(re.compile("\"|'").match)

    def line_split(self, line):
        """Splits the line on whitespace characters, considering optional
        quoting to envelop strings with whitespace in them.

        Examples:
          one two 'three four'
          => ["one", "two", "three four"]

          one        '' two
          => ["one", "", "two"]

        """
        parts = []
        part = None
        quote = None
        for c in line:
            if part is None and not self.is_space(c):
                quote = c if self.is_quote(c) else None
                part = c if quote is None else ""
            elif part is not None and quote is None and not self.is_space(c):
                part += c
            elif part is not None and quote is not None:
                if c != quote:
                    part += c
                else:
                    parts.append(part)
                    part = None
                    quote = None
            elif part is not None and quote is None and self.is_space(c):
                parts.append(part)
                part = None
                quote = None
        if part is not None:
            parts.append(part)
        return parts

    def add_arguments(self, parser):
        parser.add_argument(
            "file",
            nargs="?",
            help="The input file, or stdin if omitted",
        )
        parser.add_argument(
            "--dry",
            action="store_true",
            dest="dry",
            help="Parse events but don't index them",
        )
        parser.add_argument(
            "--group-by",
            dest="group_by",
            help="Grouping criterion (minute, hour, day, week, month, all)",
        )
        parser.add_argument(
            "--batch-interval",
            dest="batch_interval",
            help="Time between dispatching batches (seconds)",
        )
        parser.add_argument(
            "--indexonly",
            action="store_true",
            dest="indexonly",
            help="Only index events, don't dispatch the corresponding message",
        )
        parser.add_argument(
            "--dispatchonly",
            action="store_true",
            dest="dispatchonly",
            help="Only dispatch the message(s), don't index events",
        )
        parser.add_argument(
            "--columns",
            dest="columns",
            help="Column order in the data: t for timestamp, v for value, n for name, "
            "x (optional) for x-coordinate, "
            "y (optional) for y-coordinate, "
            "z (optional) for z-coordinate; "
            "l (optional) for an arbitrary tag to add to the event; "
            "default is tnv",
        )
        parser.add_argument(
            "--request-timeout",
            dest="request_timeout",
            help="The elasticsearch request timeout used for each bulk index operation (default 30)",
        )
        parser.add_argument(
            "--sorted",
            action="store_true",
            dest="sorted",
            help="Mark the input events as sorted by date, so sorting won't be performed by this command",
        )

    def as_event(self, timestamp, name, value, coords, labels):
        dt = parse_datetime(timestamp)
        return {
            "_timestamp": dt,
            "@timestamp": dt.isoformat(),
            "name": name,
            "coords": {
                k: float(v)
                for k, v in coords.items()
            },
            "value": float(value),
            "labels": labels,
        }

    def events(self, columns, source):
        for line in source:
            line = line.strip()
            if not line:
                continue
            parts = self.line_split(line)
            data = dict(zip(columns, parts))
            yield self.as_event(**{
                "timestamp": data["t"],
                "name": data["n"],
                "value": data["v"],
                "coords": {
                    **({"x": data.get("x")} if "x" in data else {}),
                    **({"y": data.get("y")} if "y" in data else {}),
                    **({"z": data.get("z")} if "z" in data else {}),
                },
                "labels": (
                    [{"key": "enrichment-tag", "value": data.get("l")}]
                    if "l" in data
                    else []
                )
            })

    def groupfn(self, grouping):
        if grouping == "all":
            return lambda _: True
        if grouping == "year":
            return lambda event: event["@timestamp"][0:4]
        if grouping == "month":
            return lambda event: event["@timestamp"][0:7]
        if grouping == "week":
            return lambda event: event["_timestamp"].isocalendar()[0:2]
        if grouping == "day":
            return lambda event: event["@timestamp"][0:10]
        if grouping == "hour":
            return lambda event: event["@timestamp"][0:13]
        if grouping == "minute":
            return lambda event: event["@timestamp"][0:16]

    def group_by(self, events, grouping, previously_sorted):
        if not previously_sorted:
            events = list(events)
            events.sort(key=lambda event: event["@timestamp"])
        for _, batch in it.groupby(events, self.groupfn(grouping)):
            yield [
                {k: v for k, v in event.items() if not k.startswith("_")}
                for event in batch
            ]

    def log(self, verbosity):
        return (
            (lambda message: self.stdout.write(message))
            if verbosity > 0 else
            lambda _: None
        )

    def handle(self, *args, **kwargs):
        verbosity = kwargs.get("verbosity", 1)
        if verbosity > 0:
            self.stdout.write(
                f"{self.style.NOTICE('Warning')}: "
                "loadevents is deprecated in favor of etloperation with the 'generic' executor"
            )
        log = self.log(verbosity)
        source = kwargs.get("file")
        dry = kwargs.get("dry", False)
        group_by = (kwargs.get("group_by") or "all").lower()
        batch_interval = int(kwargs.get("batch_interval") or "0")
        indexonly = bool(kwargs.get("indexonly"))
        dispatchonly = bool(kwargs.get("dispatchonly"))
        columns = kwargs.get("columns") or "tnv"
        request_timeout = float(kwargs.get("request_timeout") or "30")
        previously_sorted = bool(kwargs.get("sorted"))
        assert not source or Path(source).is_file(), "file must be a valid file path"
        assert group_by in self.GROUPINGS, f"Invalid grouping parameter '{group_by}'"
        assert not (indexonly and dispatchonly), "Can't use both --indexonly and --dispatchonly"
        assert columns == "".join(c for i, c in enumerate(columns) if c not in columns[0:i]),\
            "Can't have duplicate columns"
        assert set(columns) <= set("tnvxyzl"), f"Invalid column ordering '{columns}'"
        with (nullcontext(sys.stdin) if not source else open(source, "r")) as sourcefile:
            events = self.events(columns, sourcefile)
            first = next(events, None)
            isempty = first is None
            if isempty:
                log("No events given")
                return
            for batch in self.group_by(it.chain((first,), events), group_by, previously_sorted):
                if not dry:
                    if not dispatchonly:
                        bulk_index(
                            batch,
                            request_timeout=request_timeout,
                            **({"refresh": "true"} if settings.TESTING else {}),
                        )
                        log(f"Indexed {len(batch)} events")
                    if not indexonly:
                        dispatch(batch)
                        log(f"Dispatched message with {len(batch)} events")
                else:
                    log("Writing batch of events:")
                    for event in batch:
                        self.stdout.write(json.dumps(event, separators=(",", ":")))
                if batch_interval > 0:
                    log(f"Sleeping for {batch_interval} seconds")
                    time.sleep(batch_interval)
