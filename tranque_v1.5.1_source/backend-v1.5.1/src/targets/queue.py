import json
import logging

from django.conf import settings
import kombu

logger = logging.getLogger(__name__)


def dispatch(events):
    """Dispatch a single message with the given events into the data
    exchange.

    """
    if settings.TESTING:
        logger.info("dispatch() called in test environment; resolves to noop")
        return
    message = {"events": events}
    try:
        with kombu.Connection(settings.BROKER_URL, ssl=settings.AMQP_SSL) as conn:
            with conn.channel() as channel:
                producer = kombu.Producer(
                    channel,
                    exchange=kombu.Exchange(settings.AMQP_EXCHANGE, type="topic"),
                    routing_key=settings.AMQP_TOPIC,
                )
                producer.publish(message)
    except Exception as e:
        if not settings.DEBUG:
            raise e
        else:
            logger.exception(e)
            logger.error(f"Couldn't enqueue message {json.dumps(message)}")
