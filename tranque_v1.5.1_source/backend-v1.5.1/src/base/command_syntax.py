import functools
import itertools

EXPANDER_PREFIX = "with_"
EXPANDER_LENGTH = len(EXPANDER_PREFIX)


def generate_replacements(obj):
    """Generates an iterable of replacements from an object which contains
    a key prefixed with the EXPANDER_PREFIX.

    """
    replace_with = {}
    for key in obj:
        if key.startswith(EXPANDER_PREFIX):
            val = obj.get(key)
            if isinstance(val, list):
                replace_with[key[EXPANDER_LENGTH:]] = val
            elif val.get("range"):
                r = val.get("range")
                replace_with[key[EXPANDER_LENGTH:]] = list(
                    range(r.get("start", 0), r.get("stop", 0), r.get("step", 1))
                )
            else:
                raise ValueError(f"malformed structure: {val}")
    pairsets = [
        [(k, v) for v in values]
        for k, values in replace_with.items()
    ]
    return map(dict, itertools.product(*pairsets))


def replace(obj, replacements):
    """Replaces the given replacements (a dictionary of strings to values)
    in the given obj, an object with some values in python string
    template syntax:

    https://docs.python.org/3/library/string.html#formatstrings

    """
    if not replacements:
        return obj
    if isinstance(obj, str):
        return obj.format(**replacements)
    if isinstance(obj, dict):
        return {k: replace(v, replacements) for k, v in obj.items()}
    if isinstance(obj, (list, tuple)):
        return [replace(v, replacements) for v in obj]
    return obj


def replaced(obj, extra=None):
    """Returns an iterable of replacing whatever can be replaced in obj,
    according to EXPANDER_PREFIX.

    *extra*, if given, corresponds to an explicitly injected variable
    for replacing. For example: extra={"target": ["some-target"]} will
    add the 'with_target: ["some-target"]' replacement to *obj*.

    """
    return map(functools.partial(replace, obj), generate_replacements({
        **{
            f"{EXPANDER_PREFIX}{k}": v
            for k, v in (extra or {}).items()
        },
        **obj
    }))


def replaced_collection(collection, extra=None):
    """Flatmaps `replaced()` onto the elements of a collection."""
    return (
        obj
        for template in collection
        for obj in replaced(template, extra=extra)
    )
