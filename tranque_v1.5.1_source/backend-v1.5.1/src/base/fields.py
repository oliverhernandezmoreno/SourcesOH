import base64
import collections
from functools import wraps
import secrets
import uuid

from django.conf import settings
from django.contrib.gis.db import models
from django.contrib.postgres.fields import JSONField
from django.core.exceptions import ValidationError
import jsonschema


class ValidatedJSONField(JSONField):

    def __init__(self, *args, **kwargs):
        schema = kwargs.pop("schema", None)
        super().__init__(*args, **kwargs)
        self._schema = schema

    @property
    def schema(self):
        return self._schema

    def deconstruct(self):
        name, path, args, kwargs = super().deconstruct()
        kwargs["schema"] = self._schema
        return name, path, args, kwargs

    def validate_against_schema(self, value):
        if value is None or self._schema is None:
            return value
        try:
            jsonschema.validate(value, self._schema)
            return value
        except jsonschema.ValidationError as e:
            raise ValidationError(e.message)

    def pre_save(self, instance, add):
        cleaned = super().pre_save(instance, add)
        return self.validate_against_schema(cleaned)

    def to_python(self, value):
        cleaned = super().to_python(value)
        return self.validate_against_schema(cleaned)


META_SCHEMA = {
    "type": "object",
    "patternProperties": {
        "^.*$": {
            "type": "object",
            "properties": {
                "value": {"type": ["number", "string", "boolean", "null"]},
                "name": {"type": "string"},
                "order": {"type": "number"},
            },
            "additionalProperties": False,
            "required": ["value"],
        }
    }
}


def MetaJSONField(*args, **kwargs):
    return ValidatedJSONField(*args, **{**kwargs, "schema": META_SCHEMA})


def generate_id():
    namespace_uuid = uuid.uuid5(uuid.NAMESPACE_DNS, settings.NAMESPACE)
    id = uuid.uuid5(namespace_uuid, secrets.token_urlsafe(32))
    return base64.urlsafe_b64encode(id.bytes).decode("utf-8").rstrip("=")


def AutoUUIDField():
    return models.CharField(max_length=22, primary_key=True, default=generate_id, editable=False)


def injectable_property(method):
    key = f"_{method.__name__}"

    @property
    @wraps(method)
    def wrapped(self):
        if hasattr(self, key):
            return getattr(self, key)
        return method(self)

    return wrapped


class StringEnum:

    def __init__(self, *args, **kwargs):
        super().__setattr__(
            "_values",
            collections.OrderedDict([
                *((k, k) for k in args),
                *((k, v) for k, v in kwargs.items())
            ])
        )

    def __getattr__(self, k):
        if k in self._values:
            return self._values[k]
        raise AttributeError(f"{k} is not a member of this enum")

    def __setattr__(self, k, v):
        raise TypeError("can't set an enum's member")

    def __iter__(self):
        return iter(self._values.values())

    def __contains__(self, k):
        return k in set(self._values.values())

    def __repr__(self):
        return "".join([
            "StringEnum(",
            ", ".join(f"{k}={repr(v)}" for k, v in self._values.items()),
            ")"
        ])


def cached_method(method):
    "A cached decorator for any method of hashable arguments"
    cache_field = f"_{method.__name__}_cache"

    @wraps(method)
    def wrapped(self, *args, **kwargs):
        cache = getattr(self, cache_field, {})
        key = (args, frozenset(kwargs.items()))
        if key not in cache:
            cache[key] = method(self, *args, **kwargs)
        setattr(self, cache_field, cache)
        return cache[key]

    return wrapped
