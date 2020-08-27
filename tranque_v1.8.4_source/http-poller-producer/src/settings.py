import os

COMMIT = os.getenv("COMMIT")

SENTRY_DSN = os.getenv("HTTP_POLLER_SENTRY_DSN")

LOG_LEVEL = os.getenv("LOG_LEVEL", "info")

FAKE_SEND = os.getenv("FAKE_SEND", "0") == "1"

CONSUMER_ENDPOINT = os.getenv("CONSUMER_ENDPOINT", "http://localhost/beats/").split(",")

CONSUMER_PASSWORD = os.getenv("CONSUMER_PASSWORD", "fakepassword")

CONSUMER_TIMEOUT = int(os.getenv("CONSUMER_TIMEOUT", "30"), 10)

SCRIPT_FILE = os.getenv("SCRIPT_FILE", "aux/demo_script_single.py")

POLL_INTERVAL = int(os.getenv("POLL_INTERVAL", "300"), 10)

POLL_TIMEOUT = int(os.getenv("POLL_TIMEOUT", "30"), 10)

HEARTBEAT_NAME = os.getenv("HEARTBEAT_NAME", "global-namespace.none.heartbeat")

HEARTBEAT_INTERVAL = int(os.getenv("HEARTBEAT_INTERVAL", "60"), 10)


def freeze():
    """Returns a fresh dictionary with this module's settings.

    """
    return {
        k: v
        for k, v in globals().items()
        if k.isupper()
    }
