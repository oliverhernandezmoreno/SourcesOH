import secrets

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Permission, Group
from guardian.shortcuts import assign_perm

from api.tests.base import BaseTestCase
from api.v1.serializers.user_serializers import UserFullSerializer
from targets.models import Target


class UserViewTestCase(BaseTestCase):

    @classmethod
    def setUpTestData(cls):
        cls.forms_perm = Permission.objects.filter(
            content_type__app_label='targets', codename__startswith='reportforms.').first()
        cls.tickets_perm = Permission.objects.filter(
            content_type__app_label='targets', codename__startswith='ticket.').first()
        cls.view_target = Permission.objects.get(content_type__app_label='targets', codename='view_target')
        cls.change_target = Permission.objects.get(content_type__app_label='targets', codename='change_target')

        cls.user = get_user_model().objects.create(username=f'user_1_{secrets.token_urlsafe(6)}')
        target = Target.objects.get(canonical_name=cls.target)
        cls.target2 = Target.objects.exclude(canonical_name=cls.target).first()

        cls.group = Group.objects.create(name=f'group_2_{secrets.token_urlsafe(6)}')
        cls.user.groups.set([cls.group])
        cls.user_password = f'test_password_{secrets.token_urlsafe(6)}'
        cls.user.set_password(cls.user_password)
        cls.user.save()

        # global perm for user
        assign_perm(cls.forms_perm, cls.user)
        # global perm for group
        assign_perm(cls.tickets_perm, cls.group)
        # target perm for user
        assign_perm(cls.view_target, cls.user, target)
        assign_perm(cls.view_target, cls.user, cls.target2)
        # target perm for group
        assign_perm(cls.change_target, cls.group, target)

    def test_user_permission_serialization(self):
        serializer = UserFullSerializer(self.user)
        data = serializer.data
        self.assertIn('entities', data)
        self.assertEqual(len(data['entities']), 2)

        self.assertIn('targets', data)
        self.assertEqual(len(data['targets']), 2)

        target_data = next(t for t in data['targets'] if t['canonical_name'] == self.target)
        self.assertIsNotNone(target_data)
        self.assertIn('permissions', target_data)
        self.assertSetEqual(set(target_data['permissions']), {self.view_target.codename, self.change_target.codename})

        target2_data = next(t for t in data['targets'] if t['canonical_name'] == self.target2.canonical_name)
        self.assertIsNotNone(target2_data)
        self.assertIn('permissions', target2_data)
        self.assertSetEqual(set(target2_data['permissions']), {self.view_target.codename})

        self.assertIn('global_permissions', data)
        self.assertSetEqual(set(data['global_permissions']), {self.forms_perm.codename, self.tickets_perm.codename})

    def test_get_token_response(self):
        response = self.client_post('/api/v1/auth/token/', {
            'username': self.user.username,
            'password': self.user_password
        })
        self.assertResponseOk(response)
        self.assertIn('user', response.data)
        rd = response.data['user']
        sd = UserFullSerializer(self.user).data
        self.assertDictEqual(rd, sd)

    def test_user_api(self):
        self.as_user(self.user)
        with self.subTest("retrieve"):
            response = self.client_get(f'/api/v1/user/{self.user.username}/')
            self.assertResponseOk(response)
            self.assertDictEqual(response.data, UserFullSerializer(self.user).data)

        with self.subTest("me"):
            response = self.client_get('/api/v1/user/me/')
            self.assertResponseOk(response)
            self.assertDictEqual(response.data, UserFullSerializer(self.user).data)
