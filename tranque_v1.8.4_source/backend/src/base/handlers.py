import logging
from traceback import TracebackException

from base.views import HealthChecker
from remotes.dispatch import handler

logger = logging.getLogger(__name__)


@handler("health.request", foreign_only=False)
def report_health(message, send):
    """Respond to a health report request with a summary of the health of
    the system.

    """
    try:
        health = HealthChecker.perform()
    except Exception as e:
        health = {
            "error": "couldn't perform health check",
            "details": [
                line[:-1]
                for line in TracebackException.from_exception(e).format()
            ],
        }
    send(message.make_response(
        command="health.response",
        body=health,
    ))


@handler("health.response", foreign_only=False)
def log_remote_health(message, send):
    """Log a health response to the default logger.

    """
    logger.info(f"health response from {message.origin}")
    logger.info(message.body)
