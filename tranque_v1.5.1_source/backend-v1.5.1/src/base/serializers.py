from functools import lru_cache

from django.conf import settings
import pyproj
from rest_framework import serializers


def freeze(v):
    if isinstance(v, dict):
        return frozenset((freeze(key), freeze(value)) for key, value in v.items())
    if isinstance(v, list):
        return tuple(freeze(value) for value in v)
    return v


def unfreeze(v):
    if isinstance(v, frozenset):
        return dict((unfreeze(key), unfreeze(value)) for key, value in v)
    if isinstance(v, tuple):
        return [unfreeze(value) for value in v]
    return v


class CoordsSerializerMixin(serializers.Serializer):
    deg_coords = serializers.SerializerMethodField()

    def get_deg_coords(self, obj):
        if not obj.coords:
            return None
        lng, lat = pyproj.Proj(init=f"epsg:{obj.coords.get('srid', settings.PROJECTION_SRID)}")(
            obj.coords["x"],
            obj.coords["y"],
            inverse=True,
        )
        return {"lat": lat, "lng": lng}


@lru_cache()
def empty_serializer(model):
    return type(
        "EmptySerializer",
        (serializers.ModelSerializer,),
        {"Meta": type("Meta", (), {"model": model, "fields": ()})},
    )


@lru_cache()
def default_serializer(model):
    return type(
        "DefaultSerializer",
        (serializers.ModelSerializer,),
        {"Meta": type("Meta", (), {
            "model": model,
            "exclude": getattr(model, "excluded_serialization_fields", ()),
        })},
    )


def serialize_variant(variant):
    "Returns the default serialization for any kind of ORM object."
    if variant is None:
        return None
    return default_serializer(type(variant))(variant).data
