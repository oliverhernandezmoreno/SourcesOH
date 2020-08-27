import inspect
import logging
import socket
from collections import namedtuple
from datetime import datetime
from functools import partial
from itertools import groupby

import kombu
import pytz
from django.conf import settings
from django.db import close_old_connections, transaction
from rest_framework import serializers

from remotes.models import Message
from remotes.serializers import MessageSerializer

logger = logging.getLogger(__name__)

# a mapping from command to handler procedures
dispatch_rules = {}

# a handler record
RegisteredHandler = namedtuple("RegisteredHandler", "command priority foreign_only fn")


def handler(command, priority=1, foreign_only=True):
    """Registers a procedure as a handler procedure with the given
    priority. Priorities are used to sort procedures for the same
    command, where higher priority values are executed
    first. *foreign_only* marks the handler as a procedure that should
    only be invoked when the message received comes from another
    namespace.

    """

    def register(fn):
        handlers = dispatch_rules.get(command, [])
        handlers = [
            *(handler_ for handler_ in handlers if handler_.fn is not fn),
            RegisteredHandler(command, priority, foreign_only, fn),
        ]
        handlers.sort(key=lambda record: record.priority, reverse=True)
        dispatch_rules[command] = handlers
        return fn

    return register


def dispatch_messages(conn, messages):
    """Dispatches several messages to their respective exchanges.

    """
    acks = []
    for exchange, batch in groupby(messages, lambda m: m.exchange):
        producer = kombu.Producer(
            conn,
            exchange=kombu.Exchange(exchange, type="fanout")
        )
        for serialized_message in map(MessageSerializer.serialize_message, batch):
            acks.append(producer.publish(serialized_message))
    return acks


def send_simple_smc_message(command, body=None):
    """Send a message to the SMC broker and exchange.

    """
    return send_simple_message(
        command,
        body=body,
        exchange=settings.SMC_AMQP_EXCHANGE,
        broker_url=settings.SMC_BROKER_URL,
        broker_connection_ssl=settings.SMC_AMQP_SSL,
    )


def send_simple_message(command, body=None, exchange=None, broker_url=None, broker_connection_ssl=settings.AMQP_SSL):
    """Build a message from the given parts and then call send_message.

    """
    message = Message.objects.create(
        command=command,
        body=body if body is not None else {},
        exchange=exchange or settings.AMQP_FEDERATED_EXCHANGE,
    )
    return send_message(
        message,
        broker_url=broker_url or settings.BROKER_URL,
        broker_connection_ssl=broker_connection_ssl,
    )


def send_message(message, broker_url=settings.BROKER_URL, broker_connection_ssl=settings.AMQP_SSL):
    """Wrap a single message in a list and then call send_messages

    """
    return send_messages([message], broker_url, broker_connection_ssl)


def send_messages(messages, broker_url=settings.BROKER_URL, broker_connection_ssl=settings.AMQP_SSL):
    """Sends messages to their respective exchanges, opening a new
    connection to do so.

    """
    # do not send messages out while running test
    if settings.TESTING:
        return []
    with kombu.Connection(broker_url, ssl=broker_connection_ssl) as conn:
        return dispatch_messages(conn, messages)


def get_save_params(msg):
    save_params = {}
    if hasattr(msg, 'properties') and 'timestamp' in msg.properties:
        # timestamp in properties is the timestamp when a message first enters RabbitMQ
        save_params['created_at'] = datetime.fromtimestamp(msg.properties['timestamp']).replace(tzinfo=pytz.utc)
    return save_params


def receive_callback(body, msg, dispatch_fn, raise_exceptions=False):
    """Main callback with the response cycle for all registered handlers.

    """
    if not settings.TESTING:
        msg.ack()
    try:
        save_params = get_save_params(msg)
        serializer = MessageSerializer(
            data=body,
            context={
                "exchange": msg.delivery_info.get("exchange")
                if not settings.TESTING
                else "test"
            },
        )
        serializer.is_valid(raise_exception=True)
        message = serializer.save(**save_params)
    except serializers.ValidationError as e:
        if raise_exceptions:
            raise e
        logger.exception(e)
        return

    logger.info(f"Received valid message at exchange {message}")

    outward_messages = []
    rules = dispatch_rules.get(message.command, [])
    for rule in rules:
        if rule.foreign_only and not message.is_foreign:
            continue
        try:
            with transaction.atomic():
                rule.fn(message, outward_messages.append)
        except Exception as e:
            if raise_exceptions:
                raise e
            logger.exception(e)

    outward_messages.sort(key=lambda m: m.exchange)
    dispatch_fn(outward_messages)


def make_receive_callback(conn):
    """Make a receive callback based on the connection given.

    """

    def strict_receive_callback(body, msg):
        close_old_connections()
        result = receive_callback(body, msg, partial(dispatch_messages, conn))
        return result

    return strict_receive_callback


class Consumer:

    def __init__(self, exchange_names, queue_name, broker_url, broker_connection_ssl):
        self.exchange_names = exchange_names
        self.queue_name = queue_name
        self.broker_url = broker_url
        self.broker_connection_ssl = broker_connection_ssl

    def force_exchange_names(self):
        """Force the exchange names to be re-generated.

        """
        return frozenset(
            self.exchange_names()
            if inspect.isroutine(self.exchange_names)
            else self.exchange_names
        )

    def listen(self, conn, channel, callback, current_exchange_names):
        """Listen until there's a change in exchange names.

        """
        exchanges = [
            kombu.Exchange(exchange, type="fanout", channel=channel)
            for exchange in current_exchange_names
        ]
        queues = [
            kombu.Queue(
                self.queue_name,
                exchange=exchange,
                channel=channel,
                queue_arguments={
                    "x-message-ttl": settings.AMQP_MESSAGE_TTL,
                    "x-expires": max(settings.AMQP_MESSAGE_TTL, settings.AMQP_QUEUE_TTL),
                },
            )
            for exchange in exchanges
        ]
        for q in queues:
            q.declare()
        with conn.Consumer(queues, callbacks=[callback]):
            while True:
                try:
                    conn.drain_events(timeout=30.0)
                except socket.timeout:
                    pass
                close_old_connections()
                new_exchange_names = self.force_exchange_names()
                if current_exchange_names != new_exchange_names:
                    logger.info(
                        "Detected a change in exchange names "
                        f"({len(new_exchange_names) - len(current_exchange_names)})"
                    )
                    return new_exchange_names

    def start(self):
        """Starts this consumer.

        """
        try:
            with kombu.Connection(self.broker_url, ssl=self.broker_connection_ssl) as conn:
                channel = conn.channel()
                callback = make_receive_callback(conn)
                names = self.force_exchange_names()
                while True:
                    names = self.listen(conn, channel, callback, names)

        except Exception as e:
            logger.exception(e)
            raise e


def start_consumer(exchange_names, queue_name, broker_url, broker_connection_ssl):
    """Starts a consumer for the given exchange names. *exchange_names*
    may be either an iterable or a function of no arguments, in which
    case it will be invoked periodically to update the exchange list.

    """
    consumer = Consumer(exchange_names, queue_name, broker_url, broker_connection_ssl)
    try:
        consumer.start()
    except KeyboardInterrupt:
        logger.info("Stopping consumer")
