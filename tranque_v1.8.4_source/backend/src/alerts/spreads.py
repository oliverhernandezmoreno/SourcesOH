# Common module spreads
from django.db.models import Q
from alerts.modules.base import spread
from targets.models import DataSource, DataSourceGroup


def spread_sectors():
    def wrapper(class_):
        return spread(DataSourceGroup, Q(parents__canonical_name='sectores'))(class_)

    return wrapper


def spread_instruments():
    def wrapper(class_):
        return spread(DataSource, Q(groups__canonical_name="piezometros") |
                      Q(groups__canonical_name="acelerografos") |
                      Q(groups__canonical_name="caudalimetros") |
                      Q(groups__canonical_name='turbidimetros'))(class_)

    return wrapper
