import tempfile

from django.http import FileResponse
from rest_framework import response, viewsets, status, serializers
from rest_framework.decorators import action
from rest_framework.exceptions import NotFound

from api.v1.serializers.event_serializer import EventTraceRequestSerializer
from api.v1.serializers.target_serializers import TimeseriesSerializer
from base.permissions import Authenticated
from remotes.dispatch import send_simple_message
from remotes.models import EventTraceRequest
from targets import graphs
from targets.elastic import get_event, get_trace, get_message, get_coverage
from targets.models import Timeseries

ROOT_COLOR = "#ff4d3c"
COVERED_COLOR = "#e5f1fa"


# Source: https://chase-seibert.github.io/blog/2011/07/29/python-calculate-lighterdarker-rgb-colors.html
def color_variant(hex_color, brightness_offset=1):
    """ takes a color like #87c95f and produces a lighter or darker variant """
    if len(hex_color) != 7:
        raise Exception("Passed %s into color_variant(), needs to be in #87c95f format." % hex_color)
    rgb_hex = [hex_color[x:x + 2] for x in [1, 3, 5]]
    new_rgb_int = [int(hex_value, 16) + brightness_offset for hex_value in rgb_hex]
    new_rgb_int = [min([255, max([0, i])]) for i in new_rgb_int]  # make sure new values are between 0 and 255
    # hex() produces "0x88", we want just "88"
    return "#" + "".join([hex(i)[2:] for i in new_rgb_int])


class NestedEventView(viewsets.GenericViewSet):
    lookup_field = "_id"
    permission_classes = (Authenticated,)
    serializer_class = serializers.BaseSerializer

    def _resolve(self, _id=None, timeseries_canonical_name=None, target_canonical_name=None):
        timeseries = Timeseries.objects.filter(
            target__canonical_name=target_canonical_name,
            canonical_name=timeseries_canonical_name,
        ).first()
        if timeseries is None:
            raise NotFound("Timeseries not found")
        event = get_event(_id)
        if not event or event.get("name") != timeseries.canonical_name:
            raise NotFound("Event not found")
        return timeseries, event

    def retrieve(self, request, **kwargs):
        _, event = self._resolve(**kwargs)
        return response.Response(data=get_coverage(event))

    def _make_graph_file(self, timeseries, events):
        tallies = {
            name: sum(1 for d in events if d.get("name") == name)
            for name in (
                d.get("name")
                for d in events
            )
        }
        tmp = tempfile.TemporaryFile()
        collection, edges = graphs.build_raw_graph(timeseries, "inputs")
        serialized = graphs.serialize_graph(
            collection,
            edges,
            forward=True,
            labelfn=lambda _, ts: "\\n".join([
                *ts.canonical_name.split("."),
                str(tallies.get(ts.canonical_name, 0)),
            ]),
            attrfn=lambda _, ts: {
                "style": (
                    "filled"
                    if ts.canonical_name == timeseries.canonical_name or ts.canonical_name in set(
                        d.get("name")
                        for d in events
                    )
                    else ""
                ),
                "color": (
                    ROOT_COLOR
                    if ts.canonical_name == timeseries.canonical_name
                    else (
                        color_variant(COVERED_COLOR, -2 * tallies.get(ts.canonical_name, 0))
                        if ts.canonical_name in set(
                            d.get("name")
                            for d in events
                        )
                        else "#000000"
                    )
                )
            },
        )
        graphs.render_graph(serialized, tmp)
        tmp.seek(0)
        return tmp

    @action(methods=["get"], detail=True, url_path="trace-graph")
    def trace_graph(self, request, **kwargs):
        timeseries, event = self._resolve(**kwargs)
        trace_event = get_trace(event)
        graph_file = self._make_graph_file(timeseries, trace_event.get("trace", []))
        return FileResponse(graph_file, content_type="image/svg+xml")

    @action(methods=["get"], detail=True, url_path="trace")
    def trace(self, request, _id=None, **kwargs):
        timeseries, _event = self._resolve(_id=_id, **kwargs)
        inputs_only = bool(self.request.query_params.get("inputs_only", False))
        event = get_trace(_event, inputs_only=inputs_only)
        events_map = dict()
        for e in event['trace']:
            if e['name'] in events_map:
                events_map[e['name']].append(e)
            else:
                events_map[e['name']] = [e]
        events_timeseries = TimeseriesSerializer.get_queryset().filter(
            canonical_name__in=events_map.keys()
        )
        errors = event.get('trace_errors', {})
        if len(events_timeseries) != len(events_map.keys()):
            error_msg = "Can't build full trace because some timeseries are missing"
            if 'dependencies' in errors:
                errors['dependencies'].append(error_msg)
            else:
                errors['dependencies'] = [error_msg]
        serialized_timeseries = TimeseriesSerializer(events_timeseries, many=True).data
        trace_requests = EventTraceRequest.objects.filter(timeseries=timeseries, event_id=_id)
        return response.Response(data={
            'trace': [
                {
                    **st,
                    'events': events_map[st['canonical_name']]
                }
                for st in serialized_timeseries
            ],
            'errors': errors,
            'requests': EventTraceRequestSerializer(trace_requests, many=True).data
        })

    @action(methods=["post"], detail=True, url_path="trace-request")
    def trace_request(self, request, _id=None, **kwargs):
        timeseries, event = self._resolve(_id=_id, **kwargs)
        if timeseries.target.remote is not None:
            trace_request = EventTraceRequest.objects.create(
                event_id=_id, timeseries=timeseries, created_by=request.user
            )
            send_simple_message(**trace_request.get_message_args())
            return response.Response(EventTraceRequestSerializer(trace_request).data)
        else:
            return response.Response({'error': 'Event Target has no remote'}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=["get"], detail=True, url_path="message-graph")
    def message_graph(self, request, **kwargs):
        timeseries, event = self._resolve(**kwargs)
        message_event = get_message(event)
        graph_file = self._make_graph_file(timeseries, message_event.get("message", []))
        return FileResponse(graph_file, content_type="image/svg+xml")

    @action(methods=["get"], detail=True, url_path="coverage-graph")
    def coverage_graph(self, request, **kwargs):
        timeseries, event = self._resolve(**kwargs)
        coverage_event = get_coverage(event)
        graph_file = self._make_graph_file(timeseries, coverage_event.get("coverage", []))
        return FileResponse(graph_file, content_type="image/svg+xml")
