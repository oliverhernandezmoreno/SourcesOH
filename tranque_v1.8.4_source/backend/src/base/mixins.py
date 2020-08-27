from django.http import Http404
from rest_framework import mixins, status
from rest_framework.decorators import action
from rest_framework.request import clone_request
from rest_framework.response import Response


# based in https://gist.github.com/tomchristie/a2ace4577eff2c603b1b
class AssertObjectMixin(object):
    """The following mixin class may be used in order to support
    PUT-as-create-if-not-exists behavior for incoming requests.

    """
    def update(self, request, *args, **kwargs):
        instance = self.get_object_or_none()

        if instance is None:
            serializer = self.get_serializer(instance, data=request.data, partial=False)
            serializer.is_valid(raise_exception=True)
            lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
            lookup_value = self.kwargs[lookup_url_kwarg]
            extra_kwargs = {self.lookup_field: lookup_value}
            serializer.save(**extra_kwargs)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def get_object_or_none(self):
        try:
            return self.get_object()
        except Http404:
            self.check_permissions(clone_request(self.request, "POST"))


class CountMixin(object):
    """This mixin installs a '_count' action which yields the total count
    of items for a list endpoint.

    """

    @action(methods=["get"], detail=False, url_name="count", url_path="_count")
    def count(self, request):
        return Response({"count": self.get_queryset().count()})


class ListCountMixin(CountMixin, mixins.ListModelMixin):
    pass
