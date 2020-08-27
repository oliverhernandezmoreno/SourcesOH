from django.conf import settings
from django.test import TestCase
from django.utils import timezone
from rest_framework import serializers

from remotes.dispatch import handler
from remotes.dispatch import receive_callback


class TestReceiveMessages(TestCase):

    def setUp(self):
        self.responses = None
        self.malformed_message = {
            "this": "is malformed",
        }
        self.test_message_foreign = {
            "id": "foobar",
            "command": "test1",
            "body": {"something": "here"},
            "origin": settings.NAMESPACE + "-foo",
            "created_at": timezone.now().isoformat(),
        }
        self.test_message_local = {
            "id": "foobarbaz",
            "command": "test1",
            "body": {"something": "else"},
            "origin": settings.NAMESPACE,
            "created_at": timezone.now().isoformat(),
        }
        handler("test1", priority=1)(self.handler1)
        handler("test1", priority=2, foreign_only=False)(self.handler2)
        handler("test2")(self.handler3)

    @staticmethod
    def handler1(message, send):
        send(message.make_response(command="testresponse1"))

    @staticmethod
    def handler2(message, send):
        send(message.make_response(command="testresponse2"))

    @staticmethod
    def handler3(message, send):
        send(message.make_response(command="testresponse3"))

    def dispatch_fn(self, responses):
        self.responses = [r.command for r in responses]

    def tearDown(self):
        self.responses = None

    def test_message_handler_rejects_malformed_messages(self):
        """The main handler rejects messages that aren't deserializable.

        """
        self.assertRaises(
            serializers.ValidationError,
            receive_callback,
            self.malformed_message,
            None,
            self.dispatch_fn,
            raise_exceptions=True,
        )

    def test_message_handler_dispatches_in_order(self):
        """The main handler dispatches the message based on priority.

        """
        receive_callback(self.test_message_foreign, None, self.dispatch_fn)
        self.assertEqual(self.responses, ["testresponse2", "testresponse1"])

    def test_message_handler_filters_based_on_foreign_status(self):
        """The main handler filters messages based on the specific handler's
        foreing_only status.

        """
        receive_callback(self.test_message_local, None, self.dispatch_fn)
        self.assertEqual(self.responses, ["testresponse2"])
