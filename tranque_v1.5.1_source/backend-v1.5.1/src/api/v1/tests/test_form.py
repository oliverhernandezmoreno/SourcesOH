import random
import secrets
import string
from unittest.mock import MagicMock

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Permission
from django.test import override_settings
from django.urls import reverse
from guardian.shortcuts import assign_perm
from rest_framework import status

from api.tests.base import BaseTestCase
from api.v1.handlers.form_handlers import (
    form_instance_create,
    form_instance_create_ack, form_instance_answer_update,
    form_instance_answer_update_ack, get_form_instance_message, form_instance_request,
)
from api.v1.serializers.form_serializers import ReportFormRequestSerializer
from remotes.models import Remote, Message
from reportforms.models import (
    ReportForm,
    ReportFormInstance,
    ReportFormVersion,
    FormCase,
    FormInstanceRequest,
)
from targets.models import Target

test_schema = {
    "title": "test form",
    "steps": [
        {
            "title": "test title",
            "sections": [
                {
                    "title": "section test 1",
                    "fields": [
                        {
                            "key": "q1",
                            "type": "text",
                            "label": "name"
                        },
                        {
                            "key": "q2",
                            "type": "text",
                            "label": "id"
                        }
                    ]
                },
                {
                    "title": "section test 2",
                    "fields": [
                        {
                            "key": "q3",
                            "type": "text",
                            "label": "color"
                        },
                        {
                            "key": "q4",
                            "type": "text",
                            "label": "size"
                        }
                    ]
                }]
        }
    ]
}


@override_settings(STACK_IS_SML=False)
class FormInstanceTestCase(BaseTestCase):

    @classmethod
    def setUpTestData(cls):
        # create test form and a random form to create version and instances
        cls.test_form = ReportForm.objects.create(codename='e700', name='e700')
        cls.random_form = ReportForm.objects.create(codename='eX00', name='eX00')
        cls.empty_form = ReportForm.objects.create(codename='e000', name='e000')
        # create versions
        cls.test_v1 = ReportFormVersion.objects.create(code=1, title='v1', form=cls.test_form, form_schema=test_schema)
        random_v1 = ReportFormVersion.objects.create(code=1, title='v1', form=cls.random_form)

        # targets where loaded in test runner setup (api.test.base.TestRunner)
        cls.test_target = Target.objects.get(canonical_name=cls.target)
        cls.random_target = Target.objects.get(canonical_name='los-pimientos-1')

        cls.test_count = random.randint(20, 40)
        cls.random_count = random.randint(20, 40)

        form_instances = [
            *(
                ReportFormInstance(
                    version=cls.test_v1,
                    state=ReportFormInstance.State.OPEN,
                    target=cls.test_target,
                    trimester=1,
                    year=2017
                ) for i in range(cls.test_count)
            ),
            *(
                ReportFormInstance(
                    version=random_v1,
                    state=ReportFormInstance.State.OPEN,
                    target=cls.test_target,
                    trimester=2,
                    year=2017
                ) for i in range(cls.random_count)
            )
        ]

        ReportFormInstance.objects.bulk_create(form_instances)

        random_instances = [
            ReportFormInstance(
                version=random_v1,
                state='open',
                target=cls.random_target,
                trimester=3,
                year=2017
            ) for i in range(cls.random_count)
        ]

        ReportFormInstance.objects.bulk_create(random_instances)

        cls.random_instance = ReportFormInstance.objects.filter(version=random_v1).first()

        cls.test_instance = ReportFormInstance.objects.filter(version=cls.test_v1).first()
        cls.user = get_user_model().objects.create(username=f'form_user_{secrets.token_urlsafe(6)}')

    def setUp(self):
        self.as_user(self.user)

    def add_permission(self, codename):
        assign_perm(
            Permission.objects.get(codename=codename, content_type__app_label='targets'),
            self.user,
            self.test_target
        )

    def test_create_form_instance(self):
        url = reverse(f'{self.api_version}:form-instance-list', args=[self.test_form.codename])

        # forbidden if not create permission
        response = self.client.post(url)
        self.assertResponseStatus(status.HTTP_403_FORBIDDEN, response)
        self.add_permission('reportforms.form.create')

        form_instances = [
            {
                'trimester': 4,
                'year': 2017,
                'version': self.test_v1.id,
                'target_canonical_name': self.test_target.canonical_name
            },
            {
                'trimester': 1,
                'year': 2018,
                'version': self.test_v1.id,
                'target_canonical_name': self.test_target.canonical_name
            },
            {
                'trimester': 2,
                'year': 2018,
                'version': self.test_v1.id,
                'target_canonical_name': self.test_target.canonical_name
            },
        ]

        for instance in form_instances:
            self.assertFalse(ReportFormInstance.objects.filter(
                version=self.test_v1,
                target=self.test_target,
                trimester=instance['trimester'],
                year=instance['year']).exists())

        response = self.client.post(url, form_instances, format='json')
        self.assertResponseStatus(status.HTTP_201_CREATED, response)

        for instance in form_instances:
            count = ReportFormInstance.objects.filter(
                    version=self.test_v1,
                    target=self.test_target,
                    trimester=instance['trimester'],
                    year=instance['year']).count()
            self.assertEqual(count, 1)

        with self.subTest('can not create if there is an instance already open in the trimester'):
            for instance in form_instances:
                count = ReportFormInstance.objects.filter(
                        version=self.test_v1,
                        target=self.test_target,
                        trimester=instance['trimester'],
                        year=instance['year']).count()
                self.assertEqual(count, 1)

                response = self.client.post(url, instance, format='json')
                self.assertResponseStatus(status.HTTP_400_BAD_REQUEST, response)

        with self.subTest('can create if instance already existing is closed'):
            for instance in form_instances:
                ReportFormInstance.objects.filter(
                    version=self.test_v1,
                    target=self.test_target,
                    trimester=instance['trimester'],
                    year=instance['year']
                ).update(state=ReportFormInstance.State.ANSWER_REVIEWED)
                self.assertEqual(ReportFormInstance.objects.filter(
                    version=self.test_v1,
                    target=self.test_target,
                    trimester=instance['trimester'],
                    year=instance['year']
                ).exclude(state__in=ReportFormInstance.CLOSED_STATES).count(), 0)
                response = self.client.post(url, instance, format='json')
                self.assertResponseStatus(status.HTTP_201_CREATED, response)

    def test_list_form_instances(self):
        url = reverse(f'{self.api_version}:form-instance-list', args=[self.test_form.codename])

        # forbidden if not read permission
        response = self.client.post(url)
        self.assertResponseStatus(status.HTTP_403_FORBIDDEN, response)
        self.add_permission('reportforms.form.read')

        with self.subTest('list form with multiple instances'):
            response = self.client.get(url, format='json')

            self.assertResponseOk(response)
            self.assertResponseStatus(status.HTTP_200_OK, response)

            self.assertEqual(response.data['count'], self.test_count)

            for x in response.data['results']:
                self.assertTrue(self.test_form.versions.filter(pk=x['version']).exists())

        with self.subTest('list form with zero instances'):
            url = reverse(f'{self.api_version}:form-instance-list', args=[self.empty_form.codename])

            response = self.client.get(url, format='json')

            self.assertResponseOk(response)
            self.assertResponseStatus(status.HTTP_200_OK, response)

            self.assertEqual(response.data['count'], 0)

    def test_retrieve_update_answer(self):
        url = reverse(
            f'{self.api_version}:form-instance-detail',
            args=[self.test_form.codename, self.test_instance.id]
        )

        new_values = {'q1': 'asdf', 'q2': 'qweqrew'}

        with self.subTest('retrieve new instance with empty answer'):
            # forbidden if not read permission
            response = self.client_get(url, format='json')
            self.assertResponseStatus(status.HTTP_403_FORBIDDEN, response)
            self.add_permission('reportforms.form.read')

            response = self.client_get(url, format='json')

            self.assertResponseOk(response)
            self.assertResponseStatus(status.HTTP_200_OK, response)

            self.assertFalse(bool(response.data['answer']))

        with self.subTest('update invalid answer'):
            invalid_values = {'asdf': 'asdf', 'q2': 'qweqrew'}

            # forbidden if not edit permission
            response = self.client_patch(url, data={'answer': invalid_values}, format='json')
            self.assertResponseStatus(status.HTTP_403_FORBIDDEN, response)
            self.add_permission('reportforms.form.edit')

            response = self.client_patch(url, data={'answer': invalid_values}, format='json')

            self.assertResponseStatus(status.HTTP_400_BAD_REQUEST, response)

            test_instance = ReportFormInstance.objects.get(id=self.test_instance.id)
            self.assertFalse(bool(test_instance.answer))
            self.assertEqual(test_instance.answer_count, 0)

        with self.subTest('update answer'):
            response = self.client_patch(
                url,
                data={
                    'answer': new_values,
                    'state': ReportFormInstance.State.ANSWER_TO_VALIDATE
                }, format='json'
            )

            self.assertEqual(status.HTTP_200_OK, response.status_code, response.data)

            test_instance = ReportFormInstance.objects.get(id=self.test_instance.id)
            self.assertDictEqual(test_instance.answer, new_values)
            self.assertEqual(test_instance.answer_count, len(new_values))

            # set as ready to validate
            response = self.client_patch(
                url,
                data={'state': ReportFormInstance.State.ANSWER_TO_VALIDATE},
                format='json'
            )
            self.assertResponseStatus(status.HTTP_200_OK, response)
            self.test_instance.refresh_from_db()
            self.assertEqual(self.test_instance.state, ReportFormInstance.State.ANSWER_TO_VALIDATE)

        with self.subTest('retrieve updated answer'):
            response = self.client_get(url, format='json')

            self.assertResponseOk(response)
            self.assertResponseStatus(status.HTTP_200_OK, response)

            self.assertTrue(bool(response.data['answer']))
            self.assertDictEqual(response.data['answer'], new_values)

        with self.subTest('validate answer'):
            data = {'state': ReportFormInstance.State.ANSWER_VALIDATED}

            # fails when no permission
            response = self.client_patch(url, data=data, format='json')
            self.assertResponseStatus(status.HTTP_403_FORBIDDEN, response)
            self.add_permission('reportforms.form.validate')

            # validate answer
            response = self.client_patch(url, data=data, format='json')
            self.assertResponseStatus(status.HTTP_200_OK, response)

            self.test_instance.refresh_from_db()
            self.assertEqual(self.test_instance.state, ReportFormInstance.State.ANSWER_VALIDATED)

    def test_form_instance_update_send(self):
        # create instance
        instance = ReportFormInstance.objects.create(
            version=self.test_v1,
            state=ReportFormInstance.State.ANSWER_VALIDATED,
            target=self.test_target,
            trimester=4,
            year=2019
        )

        url = reverse(f'{self.api_version}:form-instance-send', args=[self.test_form.codename, instance.id])
        # assert received_at date is none
        self.assertIsNone(instance.received_at)

        # fails when no send permission
        response = self.client.post(url, format='json')
        self.assertResponseStatus(status.HTTP_403_FORBIDDEN, response)

        self.add_permission('reportforms.form.read')
        self.add_permission('reportforms.form.send')

        response = self.client.post(url, format='json')
        self.assertResponseStatus(status.HTTP_200_OK, response)

        # assert state is "received"
        sent_instance = ReportFormInstance.objects.get(id=instance.id)
        self.assertEqual(sent_instance.state, ReportFormInstance.State.ANSWER_RECEIVED)
        # assert received_at is not none
        self.assertIsNotNone(sent_instance.received_at)

    def test_get_target_instances(self):
        url = reverse(f'{self.api_version}:target-form-instance', args=[self.test_target.canonical_name])

        # fails when no read permission
        response = self.client.get(url, format='json')
        self.assertResponseStatus(status.HTTP_403_FORBIDDEN, response)

        self.add_permission('reportforms.form.read')

        response = self.client.get(url, format='json')
        self.assertResponseStatus(status.HTTP_200_OK, response)
        self.assertEqual(len(response.data), self.test_count + self.random_count)
        for i in response.data:
            self.assertEqual(i['target_canonical_name'], self.test_target.canonical_name)

    def test_form_instance_handlers(self):
        # create remote
        remote = Remote.objects.create(namespace='test', exchange='test')
        self.test_target.remote = remote
        self.test_target.save()
        with self.subTest('form_instance assignment from SMC to SML'):
            with self.subTest('[handler][SMC->SML] form_instance_create'):
                # create instance
                instance = ReportFormInstance.objects.create(
                    version=self.test_v1,
                    state=ReportFormInstance.State.NEW_SENDING,
                    target=self.test_target,
                    trimester=4,
                    year=2019
                )

                # get message to send
                message = get_form_instance_message(instance, "form.form_instance.create")
                self.assertEqual(message.command, "form.form_instance.create")

                # store id and delete object, to test if handler stores the object with the same id generated
                instance_id = instance.id
                instance.delete()
                self.assertFalse(ReportFormInstance.objects.filter(id=instance_id).exists())

                send_mock = MagicMock()

                # Execute handler
                form_instance_create(message, send_mock)

                _, send_args, _ = send_mock.mock_calls[0]

                # assert instance was created with same id and state is State.OPEN
                self.assertTrue(ReportFormInstance.objects.filter(id=instance_id).exists())
                new_instance = ReportFormInstance.objects.get(id=instance_id)
                self.assertEqual(new_instance.state, ReportFormInstance.State.OPEN)

                # assert send method was called with an ack command and status 201
                self.assertEqual(len(send_args), 1)
                self.assertEqual(send_args[0].command, "form.form_instance.create.ack")
                self.assertEqual(int(send_args[0].body['status']), 201)

            with self.subTest('[handler][ACK][SML->SMC] form_instance_create'):
                # create instance
                instance = ReportFormInstance.objects.create(
                    version=self.test_v1,
                    state=ReportFormInstance.State.NEW_SENDING,
                    target=self.test_target,
                    trimester=4,
                    year=2019
                )

                # get message to send
                message = Message.objects.create(
                    command="form.form_instance.create.ack",
                    body={"id": instance.id, "status": 201}
                )

                send_mock = MagicMock()

                # Execute handler
                form_instance_create_ack(message, send_mock)

                # assert ack does not send a response
                self.assertFalse(send_mock.called)

                # assert instance state is updated from sending to sent
                new_ref = ReportFormInstance.objects.get(id=instance.id)
                self.assertEqual(new_ref.state, ReportFormInstance.State.NEW_SENT)

        with self.subTest('form_instance answer update from SML to SMC'):
            dummy_answer = {'q1': '1234asdf', 'q2': 'qweqrew'}
            trimester = 4
            year = 2019

            with self.subTest('[handler][SML->SMC] form_instance_answer_update'):
                # create instance as it would be in a SML when "sending" FormInstance
                instance = ReportFormInstance.objects.create(
                    version=self.test_v1,
                    state=ReportFormInstance.State.OPEN,
                    target=self.test_target,
                    answer=dummy_answer,
                    trimester=trimester,
                    year=year
                )
                # get message to be send
                message = get_form_instance_message(instance, "form.form_instance.answer.update")
                self.assertEqual(message.command, "form.form_instance.answer.update")

                # store id and delete object
                instance_id = instance.id
                instance.delete()
                self.assertFalse(ReportFormInstance.objects.filter(id=instance_id).exists())

                # recreate instance as how it would be in the SMC
                instance_smc = ReportFormInstance.objects.create(
                    id=instance_id,
                    version=self.test_v1,
                    state=ReportFormInstance.State.NEW_SENT,
                    target=self.test_target,
                    trimester=trimester,
                    year=year
                )

                # assert received_at date is null
                self.assertIsNone(instance_smc.received_at)

                # Execute handler
                send_mock = MagicMock()
                form_instance_answer_update(message, send_mock)

                _, send_args, _ = send_mock.mock_calls[0]

                # assert instance answer is updated
                new_instance = ReportFormInstance.objects.get(id=instance_id)
                self.assertDictEqual(new_instance.answer, dummy_answer)
                # assert instance answer is and state is set to answer received
                self.assertEqual(new_instance.state, ReportFormInstance.State.ANSWER_RECEIVED)
                # assert received_at date is not none
                self.assertIsNotNone(new_instance.received_at)

                # assert send method was called with an ack command and status 200
                self.assertEqual(len(send_args), 1)
                self.assertEqual(send_args[0].command, "form.form_instance.answer.update.ack")
                self.assertEqual(int(send_args[0].body['status']), 200)
                received_at = new_instance.received_at.isoformat()
                self.assertEqual(send_args[0].body['received_at'], received_at)

            with self.subTest('[handler][ACK][SMC->SML] form_instance_answer_update'):
                # create instance
                instance = ReportFormInstance.objects.create(
                    version=self.test_v1,
                    state=ReportFormInstance.State.ANSWER_SENDING,
                    target=self.test_target,
                    answer=dummy_answer,
                    trimester=3,
                    year=2019
                )

                # get message to send
                message = Message.objects.create(
                    command="form.form_instance.answer.update.ack",
                    body={"id": instance.id, "status": 200, "received_at": instance.received_at}
                )

                send_mock = MagicMock()

                # Execute handler
                form_instance_answer_update_ack(message, send_mock)

                # assert ack does not send a response
                self.assertFalse(send_mock.called)

                # assert instance state is updated from sending to sent
                new_ref = ReportFormInstance.objects.get(id=instance.id)
                self.assertEqual(new_ref.state, ReportFormInstance.State.ANSWER_SENT)

    def test_form_instance_review(self):
        test_form = self.test_form
        form_instance = self.test_instance
        form_instance.state = ReportFormInstance.State.ANSWER_SENT
        form_instance.save()

        self.assertEqual(form_instance.comments.count(), 0)

        instance_url = reverse(f'{self.api_version}:form-instance-detail', args=[test_form.codename, form_instance.id])

        url = reverse(f'{self.api_version}:form-instance-comment-list', args=[test_form.codename, form_instance.id])

        comment_content = 'observacion!'
        # create comment
        response = self.client.post(url, data={
            'content': comment_content
        }, format='json')
        self.assertResponseStatus(status.HTTP_403_FORBIDDEN, response)
        # set reviewed
        response = self.client.patch(instance_url, data={
            'state': ReportFormInstance.State.ANSWER_REVIEWED
        }, format='json')
        self.assertResponseStatus(status.HTTP_403_FORBIDDEN, response)

        self.add_permission('reportforms.form.read')
        self.add_permission('reportforms.form.review')

        response = self.client.post(url, data={
            'content': comment_content
        }, format='json')

        self.assertResponseStatus(status.HTTP_201_CREATED, response)

        self.assertEqual(form_instance.comments.count(), 1)
        self.assertEqual(form_instance.comments.first().content, comment_content)

        response = self.client.get(instance_url, format='json')
        self.assertResponseStatus(status.HTTP_200_OK, response)

        comments = response.data['comments']
        self.assertEqual(len(comments), 1)
        self.assertEqual(comments[0]['content'], comment_content)

        # set reviewed
        response = self.client.patch(instance_url, data={
            'state': ReportFormInstance.State.ANSWER_REVIEWED
        }, format='json')
        self.assertResponseStatus(status.HTTP_200_OK, response)

        form_instance.refresh_from_db()
        self.assertEqual(form_instance.state, ReportFormInstance.State.ANSWER_REVIEWED)

    def test_form_instance_cases(self):
        form_instance = self.test_instance
        self.add_permission('reportforms.form.read')
        with self.subTest('create case'):
            url = reverse(f'{self.api_version}:form-case-list')

            title = ''.join(random.sample(string.ascii_letters, 12))
            description = ''.join(random.sample(string.ascii_letters, 20))

            response = self.client.post(url, data={
                'form_instance': form_instance.id,
                'title': title,
                'description': description
            }, format='json')
            self.assertResponseStatus(status.HTTP_403_FORBIDDEN, response)

            self.add_permission('reportforms.form.case.create')
            response = self.client.post(url, data={
                'form_instance': form_instance.id,
                'title': title,
                'description': description
            }, format='json')

            self.assertResponseStatus(status.HTTP_201_CREATED, response)
            form_case = FormCase.objects.get(id=response.data['id'])

            self.assertEqual(form_case.form_instance.id, form_instance.id)
            self.assertEqual(form_case.title, title)
            self.assertEqual(form_case.description, description)
            # default state is open
            self.assertEqual(form_case.state, FormCase.State.OPEN)

        with self.subTest('update case'):
            form_case = FormCase.objects.create(form_instance=form_instance, title='holaaa', description='chaooo')

            url = reverse(f'{self.api_version}:form-case-detail', args=[form_case.id])

            new_title = form_case.title.join(random.sample(string.ascii_letters, 12))
            response = self.client.patch(url, data={
                'title': new_title,
                'state': FormCase.State.CLOSED
            }, format='json')
            self.assertResponseStatus(status.HTTP_403_FORBIDDEN, response)
            self.add_permission('reportforms.form.case.read')
            self.add_permission('reportforms.form.case.update')

            response = self.client.patch(url, data={
                'title': new_title,
                'state': FormCase.State.CLOSED
            }, format='json')
            self.assertResponseStatus(status.HTTP_200_OK, response)
            form_case = FormCase.objects.get(id=form_case.id)

            self.assertEqual(form_case.title, new_title)
            self.assertEqual(form_case.state, FormCase.State.CLOSED)
            with self.subTest('case reassign instance'):
                ReportFormInstance.objects.all().update(state=ReportFormInstance.State.ANSWER_REVIEWED)
                url = reverse(f'{self.api_version}:form-case-reassign', args=[form_case.id])
                response = self.client.post(url, data={'reason': 'reason'}, format='json')
                self.assertResponseStatus(status.HTTP_403_FORBIDDEN, response)
                self.add_permission('reportforms.form.case.reassign')

                response = self.client.post(url, data={'reason': 'reason'}, format='json')
                self.assertResponseStatus(status.HTTP_201_CREATED, response)

        with self.subTest('create case comment'):
            form_case = FormCase.objects.create(form_instance=form_instance, title='chaooo', description='holaaa')

            self.assertEqual(form_case.comments.count(), 0)

            url = reverse(f'{self.api_version}:form-case-comment-list', args=[form_case.id])

            comment_content = 'comentario!'
            response = self.client.post(url, data={
                'content': comment_content
            }, format='json')
            self.assertResponseStatus(status.HTTP_403_FORBIDDEN, response)

            self.add_permission('reportforms.form.case.comment')
            response = self.client.post(url, data={
                'content': comment_content
            }, format='json')

            self.assertResponseStatus(status.HTTP_201_CREATED, response)

            self.assertEqual(form_case.comments.count(), 1)
            self.assertEqual(form_case.comments.first().content, comment_content)

            url = reverse(f'{self.api_version}:form-case-detail', args=[form_case.id])
            response = self.client.get(url, format='json')

            self.assertResponseStatus(status.HTTP_200_OK, response)
            comments = response.data['comments']
            self.assertEqual(len(comments), 1)
            self.assertEqual(comments[0]['content'], comment_content)


@override_settings(STACK_IS_SML=False)
class FormInstanceRequestTestCase(BaseTestCase):

    @classmethod
    def setUpTestData(cls):
        cls.form = ReportForm.objects.create(codename='e700', name='e700')
        cls.version = ReportFormVersion.objects.create(
            code=1, title='v1', form=cls.form, form_schema=test_schema
        )
        cls.user = get_user_model().objects.create(username=f'form_user_{secrets.token_urlsafe(6)}')

    def add_permission(self, codename):
        assign_perm(
            Permission.objects.get(codename=codename, content_type__app_label='targets'),
            self.user,
            self.target_object
        )

    def setUp(self):
        self.common_args = {
            'version': self.version,
            'answer': {
                'q1': secrets.token_urlsafe(8),
                'q2': secrets.token_urlsafe(8),
                'q3': secrets.token_urlsafe(8)
            },
            'target': self.target_object,
            'trimester': 1,
            'year': 2017
        }
        self.received_instance = ReportFormInstance.objects.create(
            state=ReportFormInstance.State.ANSWER_RECEIVED,
            **self.common_args
        )
        self.sent_instance = ReportFormInstance.objects.create(
            state=ReportFormInstance.State.ANSWER_SENT,
            **self.common_args
        )
        self.open_instance = ReportFormInstance.objects.create(
            state=ReportFormInstance.State.OPEN,
            **self.common_args
        )
        self.as_user(self.user)
        self.add_permission('reportforms.form.read')

    @override_settings(STACK_IS_SML=True)
    def test_form_instance_request_create(self):
        base_url = f'{self.api_version}:form-instance-request-list'

        url = reverse(base_url, args=[self.form.codename, self.sent_instance.id])
        self.assertFalse(self.sent_instance.form_requests.all().exists())

        # execute post to create
        comment = secrets.token_urlsafe(16)
        response = self.client.post(url, data={'comment': comment}, format='json')
        self.assertResponseStatus(status.HTTP_403_FORBIDDEN, response)

        self.add_permission('reportforms.form.reassign.request')

        response = self.client.post(url, data={'comment': comment}, format='json')
        self.assertResponseStatus(status.HTTP_201_CREATED, response)

        # assert request exists
        self.assertTrue(self.sent_instance.form_requests.count(), 1)
        request_object = self.sent_instance.form_requests.first()
        self.assertEqual(request_object.old_instance.id, self.sent_instance.id)
        self.assertEqual(request_object.state, FormInstanceRequest.State.CREATED)
        self.assertEqual(request_object.comment, comment)

        with self.subTest('create with an existing pending request'):
            url = reverse(base_url, args=[self.form.codename, self.sent_instance.id])
            response = self.client.post(url, format='json')
            self.assertResponseStatus(status.HTTP_400_BAD_REQUEST, response)

        with self.subTest('create on open instance'):
            url = reverse(base_url, args=[self.form.codename, self.open_instance.id])

            response = self.client.post(url, format='json')

            self.assertResponseStatus(status.HTTP_400_BAD_REQUEST, response)

    @override_settings(STACK_IS_SML=False)
    def test_form_instance_request_create_handler(self):
        request = FormInstanceRequest.objects.create(
            old_instance=self.received_instance,
            comment=secrets.token_urlsafe(16)
        )
        body = ReportFormRequestSerializer(request).data
        request.delete()
        self.assertFalse(self.received_instance.form_requests.all().exists())

        message = Message.objects.create(
            command='form.form_instance.request',
            body=body
        )

        send_mock = MagicMock()

        # execute handler
        form_instance_request(message, send_mock)

        # assert request exists
        self.assertTrue(self.received_instance.form_requests.all().exists())
        created_request = self.received_instance.form_requests.first()
        self.assertEqual(created_request.id, body['id'])
        self.assertEqual(created_request.old_instance.id, self.received_instance.id)

    @override_settings(STACK_IS_SML=False)
    def test_form_instance_request_response_accepted(self):
        request = FormInstanceRequest.objects.create(
            old_instance=self.received_instance,
            comment=secrets.token_urlsafe(16)
        )
        base_url = f'{self.api_version}:form-instance-request-detail'
        url = reverse(base_url, args=[self.form.codename, self.received_instance.pk, request.id])

        # execute PUT request to accept
        response = self.client.put(url, data={'state': FormInstanceRequest.State.ACCEPTED}, format='json')
        self.assertResponseStatus(status.HTTP_403_FORBIDDEN, response)
        self.add_permission('reportforms.form.reassign.resolve')

        response = self.client.put(url, data={'state': FormInstanceRequest.State.ACCEPTED}, format='json')
        self.assertResponseStatus(status.HTTP_200_OK, response)

        # assert state changed
        accepted_request = FormInstanceRequest.objects.get(id=request.id)
        self.assertEqual(accepted_request.state, FormInstanceRequest.State.ACCEPTED)

        # assert new form instance was created
        self.assertIsNotNone(accepted_request.new_instance)
        for p in ['version', 'trimester', 'year', 'target']:
            self.assertEqual(
                getattr(accepted_request.new_instance, p),
                getattr(accepted_request.old_instance, p)
            )
        self.assertIsNone(accepted_request.new_instance.sent_at)
        self.assertNotEqual(accepted_request.old_instance.id, accepted_request.new_instance.id)
        self.assertEqual(accepted_request.new_instance.state, ReportFormInstance.State.OPEN)

    def test_form_instance_request_response_rejected(self):
        request = FormInstanceRequest.objects.create(
            old_instance=self.received_instance,
            comment=secrets.token_urlsafe(16)
        )
        base_url = f'{self.api_version}:form-instance-request-detail'
        url = reverse(base_url, args=[self.form.codename, self.received_instance.pk, request.id])

        # execute PUT request to reject
        response = self.client.put(url, data={'state': FormInstanceRequest.State.REJECTED}, format='json')
        self.assertResponseStatus(status.HTTP_403_FORBIDDEN, response)
        self.add_permission('reportforms.form.reassign.resolve')

        response = self.client.put(url, data={'state': FormInstanceRequest.State.REJECTED}, format='json')
        self.assertResponseStatus(status.HTTP_200_OK, response)

        # assert state changed
        rejected_request = FormInstanceRequest.objects.get(id=request.id)
        self.assertEqual(rejected_request.state, FormInstanceRequest.State.REJECTED)
        self.assertIsNone(rejected_request.new_instance)
