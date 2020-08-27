import inspect

from rest_framework.schemas import AutoSchema


class _SchemaSpec:

    def __init__(self, method, ending):
        self.method = method
        self.ending = ending

    def matches(self, path, method):
        return method == self.method and (
            self.ending(path)
            if inspect.isroutine(self.ending)
            else path.endswith(self.ending)
        )


def _make_decorator(marking, method):
    @staticmethod
    def decorator(*endings):
        ending = next(iter(endings), "")

        def wrapper(fn):
            setattr(fn, "_schema_specs", [
                *getattr(fn, "_schema_specs", []),
                _SchemaSpec(method, ending)
            ])
            setattr(fn, marking, True)
            return fn
        return wrapper
    return decorator


class parameters:

    marking = "_for_parameters"

    get = _make_decorator(marking, "GET")
    post = _make_decorator(marking, "POST")
    put = _make_decorator(marking, "PUT")
    patch = _make_decorator(marking, "PATCH")
    delete = _make_decorator(marking, "DELETE")


class serializers:

    marking = "_for_serializers"

    get = _make_decorator(marking, "GET")
    post = _make_decorator(marking, "POST")
    put = _make_decorator(marking, "PUT")
    patch = _make_decorator(marking, "PATCH")
    delete = _make_decorator(marking, "DELETE")


def _make_getter(schema, getter_name, marking):
    def getter(self, path, method):
        extensors = [
            extensor
            for _, extensor in inspect.getmembers(schema)
            if inspect.isroutine(extensor)
            if hasattr(extensor, "_schema_specs")
            if getattr(extensor, marking, False)
            if any(
                spec.matches(path, method)
                for spec in getattr(extensor, "_schema_specs")
            )
        ]
        if extensors:
            extra_fields = [
                field
                for extensor in extensors
                for field in extensor()
            ]
            return extra_fields
        return getattr(super(type(self), self), getter_name)(path, method)

    getter.__name__ = getter_name
    return getter


class CustomSchema:
    """Override manual fields in API schema."""

    @classmethod
    def as_schema(cls, *args, **kwargs):
        instance = cls(*args, **kwargs)
        return type("CustomSchema", (AutoSchema,), {
            "get_manual_fields": _make_getter(instance, "get_manual_fields", parameters.marking),
            "get_serializer_fields": _make_getter(instance, "get_serializer_fields", serializers.marking)
        })()
