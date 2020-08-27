import logging

from django.conf import settings
from django.core import management
from rest_framework import response, viewsets
from rest_framework.decorators import action

from base.management import daemon_call_command
from base.permissions import InternalOnly
from remotes.dispatch import send_simple_smc_message

logger = logging.getLogger(__name__)


class CronView(viewsets.GenericViewSet):
    permission_classes = (InternalOnly,)
    base_name = "cron"

    schema = None

    @action(methods=["post"], detail=False, url_path="15min")
    def every_fifteen_minutes(self, request):
        # If stack is an SML then send heartbeat to SMC
        if settings.STACK_IS_SML:
            send_simple_smc_message("remote.heartbeat")
        # Run the alerts engine in the background
        daemon_call_command("alertsengine", "--all-targets")

        logger.info("15min cron jobs executed successfully")
        return response.Response(data={"acknowledged": True})

    @action(methods=["post"], detail=False)
    def hourly(self, request):
        # Do nothing, for now
        logger.info("Hourly cron jobs executed successfully")
        return response.Response(data={"acknowledged": True})

    @action(methods=["post"], detail=False)
    def daily(self, request):
        # Clear off older versions
        management.call_command("deleterevisions", days=60, verbosity=0)
        # Clear off older messages
        management.call_command("deletemessages", days=60, verbosity=0)
        # Clear off older etl operations
        management.call_command("deleteetloperations", days=60, verbosity=0)

        logger.info("Daily cron jobs executed successfully")
        return response.Response(data={"acknowledged": True})

    @action(methods=["post"], detail=False)
    def weekly(self, request):
        # Do nothing, for now
        logger.info("Weekly cron jobs executed successfully")
        return response.Response(data={"acknowledged": True})

    @action(methods=["post"], detail=False)
    def monthly(self, request):
        # Do nothing, for now
        logger.info("Monthly cron jobs executed successfully")
        return response.Response(data={"acknowledged": True})
