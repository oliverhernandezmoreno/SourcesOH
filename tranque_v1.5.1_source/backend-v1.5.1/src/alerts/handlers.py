import logging

from django.conf import settings

from base.management import daemon_call_command
from remotes.dispatch import handler
from targets.models import Target, Timeseries

logger = logging.getLogger(__name__)


@handler(settings.ENRICHMENT_FORWARD_COMMAND, foreign_only=False)
def run_engine_after_results(message, send):
    """Execute an engine cycle after receiving computation results from
    enrichment.

    """
    outputs = message.extra.get("outputs", [])
    targets = Target.objects.filter(
        timeseries__in=Timeseries.objects.filter(
            canonical_name__in=list(set(o["name"] for o in outputs))
        )
    ).distinct()
    if len(targets) > 0:
        daemon_call_command("alertsengine", *(t.canonical_name for t in targets))
        logger.info(f"Executed the alerts engine for {len(targets)} targets")
    else:
        logger.info("No targets were selected for the alerts engine")
