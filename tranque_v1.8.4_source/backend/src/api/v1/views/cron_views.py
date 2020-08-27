import logging

from django.conf import settings
from rest_framework import response, serializers, viewsets
from rest_framework.decorators import action

from base import schemas
from base.management import daemon_call_command
from base.permissions import InternalOnly
from remotes.dispatch import send_simple_smc_message

logger = logging.getLogger(__name__)


class CronSchema(schemas.CustomSchema):

    @schemas.parameters.post()
    def no_parameters(self):
        return []

    @schemas.serializers.post()
    def no_fields(self):
        return []


class CronView(viewsets.GenericViewSet):
    permission_classes = (InternalOnly,)
    base_name = "cron"

    schema = CronSchema.as_schema()
    serializer_class = serializers.Serializer

    @action(methods=["post"], detail=False, url_path="15min")
    def every_fifteen_minutes(self, request):
        """Execute maintenance jobs scheduled for 'every fifteen minutes'.

        """
        # If stack is an SML then send heartbeat to SMC
        if settings.STACK_IS_SML:
            send_simple_smc_message("remote.heartbeat")
        # Run the alerts engine in the background
        daemon_call_command("alertsengine", "--all-targets")

        logger.info("15min cron jobs executed successfully")
        return response.Response(data={"acknowledged": True})

    @action(methods=["post"], detail=False)
    def hourly(self, request):
        """Execute maintenance jobs scheduled for 'every hour'.

        """
        # Do nothing, for now
        logger.info("Hourly cron jobs executed successfully")
        return response.Response(data={"acknowledged": True})

    @action(methods=["post"], detail=False)
    def daily(self, request):
        """Execute maintenance jobs scheduled for 'every day'.

        """
        # Clear off older versions
        daemon_call_command("deleterevisions", "--days=30")
        # Clear off older messages
        daemon_call_command("deletemessages", "--days=7")
        # Clear off older etl operations
        daemon_call_command("deleteetloperations", "--days=60")

        logger.info("Daily cron jobs executed successfully")
        return response.Response(data={"acknowledged": True})

    @action(methods=["post"], detail=False)
    def weekly(self, request):
        """Execute maintenance jobs scheduled for 'every week'.

        """
        # Do nothing, for now
        logger.info("Weekly cron jobs executed successfully")
        return response.Response(data={"acknowledged": True})

    @action(methods=["post"], detail=False)
    def monthly(self, request):
        """Execute maintenance jobs scheduled for 'every month'.

        """
        # Do nothing, for now
        logger.info("Monthly cron jobs executed successfully")
        return response.Response(data={"acknowledged": True})
