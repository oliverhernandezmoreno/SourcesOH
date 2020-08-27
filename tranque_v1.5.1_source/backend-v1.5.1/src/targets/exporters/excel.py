import itertools
import json
from pathlib import Path
import tempfile

from django.utils.dateparse import parse_datetime
import xlsxwriter as xlsx


MAX_TIMESERIES_COUNT = 50
CHUNK_SIZE = 1024 * 100

MAX_EVENTS = 100000
DISCLAIMER = f"Note: The maximum amount of events that can be exported for each time series is {MAX_EVENTS}"


def interval_seconds(from_, to):
    """Returns the number of seconds between two timestamp strings.

    """
    try:
        dfrom = parse_datetime(from_)
        dto = parse_datetime(to)
        return (dto - dfrom).total_seconds()
    except Exception:
        return -1


def make_sheet_name(timeseries, index=1):
    """Returns an excel-valid sheet name for the given time series.

    """
    suffix = (
        timeseries.canonical_name
        if len(timeseries.canonical_name) <= 28
        else "..." + timeseries.canonical_name[-25:]
    )
    return str(index).zfill(2) + " " + suffix


class Exporter:
    """Holds state required for the generation of exported
    spreadsheets.

    """

    def __init__(self, queryset, is_head, filters):
        self.queryset = queryset
        self.is_head = is_head
        self.filters = filters
        self.cache = {}

    @property
    def tails(self):
        if "tails" not in self.cache:
            self.cache["tails"] = [
                event
                for timeseries in self.queryset
                for event in timeseries.get_events(0, 1, desc=False, **self.filters)
            ]
        return self.cache["tails"]

    @property
    def heads(self):
        if "heads" not in self.cache:
            self.cache["heads"] = {
                ts.pk: ts.get_head(**self.filters)
                for ts in self.queryset
            }
        return self.cache["heads"]

    @property
    def minimum_timestamp(self):
        return (
            (
                min(tail["@timestamp"] for tail in self.tails)
                if self.tails
                else "undefined"
            )
            if not self.is_head
            else (
                min(
                    event["@timestamp"]
                    for head in self.heads.values()
                    if head
                    for event in head
                )
                if any(head for head in self.heads.values())
                else "undefined"
            )
        )

    def event_stream(self, timeseries):
        return (
            timeseries.get_event_stream(**self.filters)
            if not self.is_head
            else iter(self.heads.get(timeseries.pk, []))
        )


def write_excel_file(filename, exporter):
    """Writes the excel contents into a file named *filename*, according
    to queryset given.

    """
    with xlsx.Workbook(filename) as workbook:
        bold = workbook.add_format({"bold": 1})
        for index, timeseries in enumerate(exporter.queryset, start=1):
            sheet = workbook.add_worksheet(make_sheet_name(timeseries, index))
            sheet.set_column(0, 2, 26)

            unit_suffix = f" [{timeseries.unit}]" if timeseries.unit else ""

            sheet.write("A1", "Time series")
            sheet.write("B1", timeseries.canonical_name)
            sheet.write("C1", timeseries.name, bold)
            sheet.write("A2", "t0 =")
            sheet.write("B2", exporter.minimum_timestamp)
            sheet.write("A3", DISCLAIMER)

            sheet.write("A5", "Timestamp", bold)
            sheet.write("B5", "Delta t (seconds since t0)", bold)
            sheet.write("C5", f"Value{unit_suffix}", bold)

            for col, title in zip("DEFG", [*list(timeseries.space_coords or []), "Metadata"]):
                sheet.write(f"{col}5", title, bold)

            for row, event in itertools.islice(enumerate(exporter.event_stream(timeseries), start=5), MAX_EVENTS):
                sheet.write_string(row, 0, event["@timestamp"])
                sheet.write_number(row, 1, interval_seconds(exporter.minimum_timestamp, event["@timestamp"]))
                sheet.write_number(row, 2, float(event["value"]))
                for col, coord in enumerate(timeseries.space_coords or []):
                    sheet.write(row, 3 + col, (event["coords"] or {}).get(coord, ""))
                sheet.write_string(
                    row, 3 + len(timeseries.space_coords or ""),
                    json.dumps(event.get("meta"), separators=(",", ":"))
                    if event.get("meta") is not None
                    else "",
                )


def export_timeseries(queryset, head=False, **filters):
    """Returns an open file object with the exported data.

    *head* indicates whether the exportation should deal with the
    'head' of each timeseries or whether it should include the whole
    time interval.

    *filters* are filtering kwargs as they appear in
    `targets.models.Target.events_search()`.

    """
    if queryset.count() > MAX_TIMESERIES_COUNT:
        raise ValueError(f"Can't export more than {MAX_TIMESERIES_COUNT} timeseries at a time")

    if queryset.count() == 0:
        raise ValueError("No timeseries selected")

    try:
        _, inner_filename = tempfile.mkstemp(suffix=".xlsx")
        write_excel_file(inner_filename, Exporter(queryset, head, filters))
        output = tempfile.TemporaryFile()
        with open(inner_filename, "rb") as inner:
            while True:
                chunk = inner.read(CHUNK_SIZE)
                if not chunk:
                    break
                output.write(chunk)
        output.seek(0)
        return output
    finally:
        Path(inner_filename).unlink()
