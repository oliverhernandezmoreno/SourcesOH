from rest_framework import viewsets, response

from targets.models import Timeseries
from targets.profiling import get_nodes_by


class StatusView(viewsets.ViewSet):

    def as_status(self, timeseries):
        """Encode the timeseries as a status object:
            {
                "level": <natural number>,
                "short_message": <brief message intended for labels>,
                "message": <text intended for tooltips>
            }
        """
        # Decimal
        threshold = timeseries.active_thresholds.all().values_list("upper", flat=True).first()
        # float
        value = next((e["value"] for e in timeseries.get_events(0, 1)), None)

        level_value = (
            0 if (value is None or threshold is None)
            else (1 if value <= float(threshold) else 3)
        )

        return {
            "module": timeseries.canonical_name,
            "result_state": {
                "level": level_value,
                "short_message": timeseries.name,
                "message": timeseries.name
            }
        }

    def worse_state(self, status):
        max_level = max([0, *(s["result_state"]["level"] for s in status)])
        return {
            "level": max_level,
            "short_message": "",  # TODO
            "message": "",  # TODO
        }

    def list(self, request, target_canonical_name=None):
        groups = list(filter(bool, request.query_params.get("group", "").split(",")))
        if not groups:
            return response.Response(status=204)
        templates = get_nodes_by("category", groups)
        queryset = Timeseries.objects.filter(
            target__canonical_name=target_canonical_name,
            template_name__in=[t.value.canonical_name for t in templates],
        )
        status = [self.as_status(t) for t in queryset]
        return response.Response(data={
            "result_state": self.worse_state(status),
            "status": status,
        })
