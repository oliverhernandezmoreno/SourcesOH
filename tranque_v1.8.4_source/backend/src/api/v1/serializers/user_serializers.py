from django.contrib.auth.models import User
from guardian.shortcuts import get_objects_for_user
from rest_framework import serializers

from api.v1.serializers.entity_serializers import EntitySerializer, WorkSiteSmallSerializer
from api.v1.serializers.target_serializers import TargetSerializer
from base.permissions import UserPermissionChecker
from targets.models import Target


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'first_name', 'last_name', 'email', 'is_superuser')


class UserFullSerializer(serializers.ModelSerializer):
    groups = serializers.SlugRelatedField(read_only=True, slug_field='name', many=True)
    entities = serializers.SerializerMethodField()
    targets = serializers.SerializerMethodField()
    global_permissions = serializers.SerializerMethodField()

    def resolve_targets(self, obj):
        # initialize cache
        self._targets_by_user = getattr(self, "_targets_by_user", {})
        if obj.username not in self._targets_by_user:
            self._targets_by_user[obj.username] = get_objects_for_user(
                user=obj,
                perms=["targets.view_target"],
                klass=Target.objects.all(),
                with_superuser=False,
                accept_global_perms=False
            )
        return self._targets_by_user[obj.username]

    def get_targets(self, obj):
        targets = self.resolve_targets(obj)
        checker = UserPermissionChecker(obj)
        checker.prefetch_perms(targets)
        return [{
            **TargetSerializer(t).data,
            "permissions": checker.get_perms(t)
        } for t in targets]

    def get_entities(self, obj):
        targets = self.resolve_targets(obj)
        _work_sites = [w for sl in [list(x.work_sites.all()) for x in targets] for w in sl]
        _work_sites_dict = {x.id: x for x in _work_sites}
        work_sites = list(_work_sites_dict.values())

        entities = [x.entity for x in work_sites]

        ws_dict = {}
        for ws in work_sites:
            ws_dict[ws.id] = WorkSiteSmallSerializer(ws).data
            ws_dict[ws.id]['targets'] = []
        for t in targets:
            if t.work_sites.count() == 0:
                continue
            for t_ws in t.work_sites.all():
                ws_dict[t_ws.id]['targets'].append(t.canonical_name)
        result = {}
        for e in entities:
            result[e.id] = EntitySerializer(e).data
            result[e.id]['work_sites'] = []
        for ws in work_sites:
            result[ws.entity.id]['work_sites'].append(ws_dict[ws.id])

        return list(result.values())

    def get_global_permissions(self, obj):
        return list([perm.split('.', 1)[1] for perm in obj.get_all_permissions()])

    class Meta:
        model = User
        fields = (
            'id', 'username', 'first_name', 'last_name', 'email', 'groups', 'entities', 'targets', 'global_permissions',
            'is_superuser'
        )


class NotAnAuthorException(Exception):
    pass


def serialize_author(author):
    if author is None:
        return None
    if isinstance(author, User):
        return UserSerializer(author).data
    raise NotAnAuthorException(f'Invalid author: {str(author)}')
