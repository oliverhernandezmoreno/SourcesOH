"""backend URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.conf import settings
from django.contrib import admin
from django.http import HttpResponse
from django.urls import include, path, re_path
from django.utils.translation import ugettext_lazy

import base.views
import kibana.views

admin.site.site_title = ugettext_lazy("Backend administration")
admin.site.site_header = ugettext_lazy("Programa Tranque")
admin.site.index_title = ugettext_lazy(f"Backend administration – {settings.COMMIT[:7]}")

urlpatterns = [
    path("", lambda req: HttpResponse(status=204)),
    path("admin/", admin.site.urls),
    path("api/", include("api.urls")),
    path("api/health/", base.views.HealthChecker.as_view()),
    re_path("^kibana/(.*)$", kibana.views.AuthWall.as_view()),
]

if settings.ENABLE_SILK_PROFILING:
    urlpatterns += [path('api/silk/', include('silk.urls', namespace='silk'))]
