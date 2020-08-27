from rest_framework.routers import DefaultRouter
from rest_framework_nested.routers import NestedDefaultRouter

from api.public.views.info_views import InfoListView, SiteParameterView
from api.public.views.status_views import StatusView
from api.public.views.target_views import TargetView
from api.public.views.zone_views import ZoneListView

root_router = DefaultRouter()

# /info/
# /info/_count
root_router.register(r"info", InfoListView, "info")

# /target/
# /target/_count
# /target/<canonical_name>/
# /target/<canonical_name>/mvp/presion/
# /target/<canonical_name>/mvp/turbiedad/
root_router.register("target", TargetView, "target")

# router nested in /target/<target_canonical_name>/
nested_target_router = NestedDefaultRouter(root_router, "target", lookup="target")

# /target/<target_canonical_name>/status/
nested_target_router.register("status", StatusView, "status")

# /zone/
# /zone/_count
root_router.register(r"zone", ZoneListView, "zone")

# /site-parameter/
root_router.register(r"site-parameter", SiteParameterView, "site-parameter")

urlpatterns = [
    *root_router.urls,
    *nested_target_router.urls,
]

app_name = "api"
