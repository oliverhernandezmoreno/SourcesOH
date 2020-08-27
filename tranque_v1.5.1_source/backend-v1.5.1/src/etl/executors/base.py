"""The basis for an ETL executor. Defines the ETLPipeline class, used
to create pipelines in each executor. This module by itself is not an
executor (it doesn't define a 'Pipeline' class).

"""
from itertools import groupby

from django.conf import settings
from django.db import transaction

from etl.models import (
    ETLOperation,
    ETLExtractedValue,
)
from etl.parser import parse_workbook
from targets.elastic import bulk_index
from targets.queue import dispatch


class ETLPipeline:
    """An ETL pipeline, as declared by the three ECC phases and the
    optional context validator. Users should subclass this and
    override, at the very least, the clean() and conform() procedures.

    """

    # Context mixed with the given context
    default_context = {}

    def __init__(self, executor):
        self.executor = executor

    def validate_context(self, target, context, data_file):
        """Default validation is no validation.

        """
        pass

    def should_extract_sheet(self, ctx, sheet_number, sheet):
        """Determines whether the extract procedure should consider the given
        sheet. Defaults to a sensible criterion.

        """
        return (
            ("sheet_numbers" not in ctx) or
            (sheet_number in ctx.get("sheet_numbers", ()))
        ) and (
            sheet_number not in ctx.get("excluded_sheet_numbers", ())
        )

    def should_extract_line(self, ctx, sheet_number, sheet, linenumber, row):
        """Determines whether the extract procedure should consider the given
        line. Defaults to a sensible criterion.

        """
        return linenumber >= ctx.get("first_line", 1)

    def extract(self, operation):
        """Performs the default extract phase of ECCD, leaving the extracted
        values in ETLExtractedValue.

        """
        try:
            data = parse_workbook(
                operation.data_file.file,
                declared_name=operation.data_file.filename
            )
        except Exception:
            operation.add_error(operation.make_error(
                "parsing-error",
                "Couldn't parse data file",
            ))
            return

        ctx = operation.initial_context or {}
        ETLExtractedValue.objects.bulk_create([
            ETLExtractedValue(
                operation=operation,
                sheet_number=sheet_number,
                sheet_name=sheet.get("name"),
                linenumber=linenumber,
                data=[
                    ETLExtractedValue.encode_cell(cell)
                    for cell in row
                ],
            )
            for sheet_number, sheet in enumerate(data)
            if self.should_extract_sheet(ctx, sheet_number, sheet)
            for linenumber, row in enumerate(sheet.get("data"), start=1)
            if self.should_extract_line(ctx, sheet_number, sheet, linenumber, row)
        ])

    def clean(self, operation):
        """Override with clean() implementation.

        """
        raise NotImplementedError("clean() not implemented")

    def conform(self, operation):
        """Override with conform() implementation.

        """
        raise NotImplementedError("conform() not implemented")

    def validate(self, operation):
        """Override with validate() implementation. By default, all values
        will be checked against each timeseries's validity ranges.

        """
        def error_template(row, operator, limit):
            return row.make_error(
                "out-of-range",
                "The row contains a value that's out of range",
                operator=operator,
                limit=float(limit),
                value=float(row.value),
            )

        for conformed in operation.conformed_values.select_related("series").iterator():
            ts = conformed.series
            if ts.range_gt is not None and conformed.value <= ts.range_gt:
                operation.add_error(error_template(conformed, "gt", ts.range_gt))
            if ts.range_gte is not None and conformed.value < ts.range_gte:
                operation.add_error(error_template(conformed, "gte", ts.range_gte))
            if ts.range_lt is not None and conformed.value >= ts.range_lt:
                operation.add_error(error_template(conformed, "lt", ts.range_lt))
            if ts.range_lte is not None and conformed.value > ts.range_lte:
                operation.add_error(error_template(conformed, "lte", ts.range_lte))

    def start(self, user, target, data_file, context):
        """Starts an ETL pipeline by instancing an operation and executing the
        ECC steps.

        """
        self.validate_context(target, context, data_file)
        with transaction.atomic():
            operation = ETLOperation.objects.create(
                user=user,
                target=target,
                data_file=data_file,
                executor=self.executor,
                initial_context={**self.default_context, **(context or {})},
            )
            self.extract(operation)
            operation.save()
            if not operation.errors:
                operation.state = ETLOperation.ETLState.CLEAN
                operation.save()
                self.clean(operation)
                operation.save()
            if not operation.errors:
                operation.state = ETLOperation.ETLState.CONFORM
                operation.save()
                self.conform(operation)
                operation.save()
                self.validate(operation)
            if operation.errors:
                operation.finished = True
                operation.save()
            return operation

    def batch_key(self, key):
        """Returns a grouping function appropriate for ETLConformedValue(s).

        """
        if key == "year":
            return lambda conformed: conformed.timestamp.utctimetuple()[0]
        if key == "month":
            return lambda conformed: conformed.timestamp.utctimetuple()[0:2]
        if key == "week":
            return lambda conformed: conformed.timestamp.isocalendar()[0:2]
        if key == "day":
            return lambda conformed: conformed.timestamp.utctimetuple()[0:3]
        if key == "hour":
            return lambda conformed: conformed.timestamp.utctimetuple()[0:4]
        if key == "minute":
            return lambda conformed: conformed.timestamp.utctimetuple()[0:5]
        return lambda _: True  # single batch

    def delivery_batches(self, operation):
        """Returns an iterator of batches of conformed values. Defaults to
        batches according to a configuration given in-context through
        the 'batch' variable. If ommitted, the 'batch' context
        variable will be read as 'month', which follows the
        partitioning scheme.

        """
        for _, batch in groupby(
                operation.conformed_values.order_by("timestamp").iterator(),
                self.batch_key((operation.initial_context or {}).get("batch", "month")),
        ):
            yield [conformed.as_event() for conformed in batch]

    def deliver(self, operation):
        """Performs the default delivery phase of ECCD.

        """
        operation.state = ETLOperation.ETLState.DELIVER
        operation.save()
        try:
            for batch in self.delivery_batches(operation):
                bulk_index(
                    batch,
                    request_timeout=30,
                    **({"refresh": "true"} if settings.TESTING else {}),
                )
                dispatch(batch)
            operation.state = ETLOperation.ETLState.SUCCESS
            operation.finished = True
            operation.save()
        except Exception as e:
            operation.add_error(operation.make_error(
                "delivery-error",
                "An unexpected error ocurred during delivery",
            ))
            operation.finished = True
            operation.save()
            raise e
