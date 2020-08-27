from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from alerts.models import AuthorizationRequest
from api.v1.serializers.ticket_serializers import AuthorizationRequestTicketSerializer
from api.v1.serializers.user_serializers import UserFullSerializer, UserSerializer
from base.permissions import Authenticated


class UserView(viewsets.ReadOnlyModelViewSet):
    lookup_field = 'username'
    permission_classes = (Authenticated,)

    def get_serializer_class(self):
        if self.action == "retrieve":
            return UserFullSerializer
        return UserSerializer

    def get_queryset(self):
        model = get_user_model()
        if self.request.user.is_superuser:
            query = model.objects.all()
        else:
            query = model.objects.filter(pk=self.request.user.pk)
        return query.prefetch_related('groups')

    @action(methods=["get"], detail=False)
    def me(self, request):
        data = UserFullSerializer(request.user).data
        return Response(data=data)

    @action(methods=["get"], detail=True)
    def ticket_authorization_request(self, request, username):
        query = AuthorizationRequest.objects.filter(
            origin=settings.NAMESPACE,
            created_by__username=username,
        ).prefetch_related('ticket__target')
        return Response(AuthorizationRequestTicketSerializer(query, many=True).data)
