import logging

from django.conf import settings

from api.v1.handlers.event_handlers import send_data_to_smc
from remotes.dispatch import handler
from targets.models import Target, Timeseries

logger = logging.getLogger(__name__)


@handler(settings.ENRICHMENT_FORWARD_COMMAND, foreign_only=False)
def receive_from_enrichment(message, send):
    """Receive enrichment outputs.

    """
    raw_message_id = message.body.get("raw_message_id")
    outputs = message.extra.get("outputs", [])
    logger.info(f"enrichment produced {len(outputs)} outputs from raw message {raw_message_id}")
    if settings.STACK_IS_SML:
        logger.info("Checking for outputs to deliver to SMC")
        from targets.profiling import get_nodes_by
        templates_to_export = set(
            node.value.canonical_name
            for category in settings.AUTO_DELIVER_CATEGORIES
            for node in get_nodes_by('category', category)
        )
        timeseries = Timeseries.objects.filter(
            canonical_name__in=set(o['name'] for o in outputs),
            template_name__in=templates_to_export
        )
        timeseries_names = set(t.canonical_name for t in timeseries)
        events = [o for o in outputs if o['name'] in timeseries_names]
        if len(events) > 0:
            logger.info(f"Sending {len(events)} outputs to SMC")
            send_data_to_smc(timeseries, events)
        else:
            logger.info(f"No outputs to deliver to SMC found")


@handler("target.applymanifest", foreign_only=False)
def applytargetmanifest(message, send):
    """Applies an index manifest to the specified target.

    """
    target = Target.objects.filter(canonical_name=message.body.get("target")).first()
    if target is None:
        logger.info(f"target not found: {message.body.get('target')}")
    target.apply_manifest(message.body.get("manifest"))
