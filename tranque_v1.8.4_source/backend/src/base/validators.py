from django.utils import dateparse
from rest_framework.exceptions import ValidationError


def validate_timestamp(s, field=None):
    "Attempts to parse the given string as if it were a timestamp"
    try:
        parsed = dateparse.parse_datetime(s)
    except ValueError:
        parsed = None
    if parsed is not None:
        return
    try:
        parsed = dateparse.parse_date(s)
    except ValueError:
        parsed = None
    if parsed is None:
        raise ValidationError(
            "value is an invalid timestamp"
            if field is None
            else {field: "value is an invalid timestamp"}
        )
