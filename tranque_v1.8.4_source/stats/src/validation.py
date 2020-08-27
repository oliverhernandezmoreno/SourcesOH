from functools import wraps
import inspect
import logging

from flask import request
import jsonschema

logger = logging.getLogger(__name__)


class ValidationError(Exception):
    """Validation error to catch non-vendor-defined validation errors.

    """

    def __init__(self, message, *args):
        super().__init__(message, *args)
        self.message = message


def build_schema(schema):
    """Builds an instance of jsonschema.IValidator starting from the given
    schema dictionary, or fail immediately if the schema is invalid.

    """
    annotated_schema = {"$schema": "http://json-schema.org/schema#", **schema}
    jsonschema.Draft7Validator.check_schema(annotated_schema)
    return jsonschema.Draft7Validator(annotated_schema)


def request_body(validator=None):
    """Helper that gets the request body, validates it as JSON, and
    validates it against a validator instance if one is given. If one
    *is* given, it should be an object with a *validate* method.

    """
    try:
        body = request.get_json(force=True)
    except Exception:
        raise ValidationError("no valid request body given")
    if validator is not None:
        validator.validate(body)
    return body


def with_schema(validator=None):
    """Wrapper that checks the request body with the given validator, and
    injects the validated body into the wrapped function parameters as
    a named 'body' parameter.

    """

    def wrapper(fn):
        sig = inspect.signature(fn)
        accepts_body = any(
            param.kind is inspect.Parameter.VAR_KEYWORD
            for param in sig.parameters.values()
        ) or any(
            name == 'body'
            for name, param in sig.parameters.items()
            if param.kind not in (
                inspect.Parameter.POSITIONAL_ONLY,
                inspect.Parameter.VAR_POSITIONAL,
            )
        )

        @wraps(fn)
        def wrapped(*args, **kwargs):
            body = request_body(validator=validator)
            if accepts_body:
                kwargs.update(body=body)
            return fn(*args, **kwargs)

        return wrapped

    return wrapper
