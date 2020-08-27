from django.conf import settings
from django.contrib.auth.mixins import UserPassesTestMixin
from revproxy.views import ProxyView


class AuthWall(UserPassesTestMixin, ProxyView):
    upstream = f"http://{settings.KIBANA_HOST}:{settings.KIBANA_PORT}/"

    def test_func(self):
        return self.request.user.is_staff or self.request.user.is_superuser
