from django.http import JsonResponse
from django.test import RequestFactory
from health_check.views import MainView as HealthCheckView


class HealthChecker(HealthCheckView):
    """Custom health check view that attaches the original data to the
    JsonResponse.

    """

    def render_to_response_json(self, plugins, status):
        data = {
            str(p.identifier()): str(p.pretty_status())
            for p in plugins
        }
        response = JsonResponse(data, status=status)
        response.data = data
        return response

    @classmethod
    def perform(cls):
        return cls.as_view()(
            RequestFactory().get(
                "/api/health/",
                HTTP_ACCEPT="application/json",
            ),
        ).data
