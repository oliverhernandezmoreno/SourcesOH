from functools import wraps
from pathlib import Path

from django.conf import settings

from alerts.collector import target_controllers

TEST_MODULES_DIR = Path(settings.BASE_DIR) / "alerts" / "tests" / "fake_trivial_modules"


def with_test_modules(method):
    @wraps(method)
    def wrapped(self):
        with target_controllers.collector.override(TEST_MODULES_DIR):
            return method(self)
    return wrapped
