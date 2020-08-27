import os
from pathlib import Path

BASE_DIR = Path(__file__).parent

DEBUG = os.getenv("STATS_DEBUG", "0") == "1"

COMMIT = os.getenv("COMMIT")

SECRET_KEY = os.getenv("STATS_SECRET_KEY", "terrible-secret")

SENTRY_DSN = os.getenv("STATS_SENTRY_DSN")

BLUEPRINTS = set([
    "health",
    "arima",
])


def freeze():
    """Returns a fresh dictionary with this module's settings.

    """
    return {
        k: v
        for k, v in globals().items()
        if k.isupper()
    }
