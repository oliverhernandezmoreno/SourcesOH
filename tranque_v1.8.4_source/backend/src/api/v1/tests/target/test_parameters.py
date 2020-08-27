from api.tests.base import BaseTestCase
from targets.models import Parameter


class NestedParameterTestCase(BaseTestCase):

    def setUp(self):
        # create parameters backed by the references at test-profiles/fake.manifest
        Parameter.objects.create(
            target=self.target_object,
            canonical_name="fake-parameter-1",
            name="Some fake parameter",
            value=None
        )
        Parameter.objects.create(
            target=self.target_object,
            canonical_name="fake-parameter-2",
            name="Some other fake parameter",
            value="loremipsum",
        )
        Parameter.objects.create(
            target=self.target_object,
            canonical_name="fake-parameter-3",
            name="Some complicated fake parameter",
            value=None
        )
        self.as_superuser()

    def url(self, *args):
        return "".join(("/".join((f"/api/{self.api_version}/target/{self.target}/parameter", *args)), "/"))

    def test_read_parameters(self):
        with self.subTest("list parameters"):
            response = self.client_get(self.url())
            self.assertResponseOk(response)
            self.assertEqual(response.data["count"], Parameter.objects.filter(target=self.target_object).count())

        with self.subTest("read single parameter"):
            response = self.client_get(self.url("fake-parameter-1"))
            self.assertResponseOk(response)
            self.assertEqual(response.data["value"], None)

            response = self.client_get(self.url("fake-parameter-2"))
            self.assertResponseOk(response)
            self.assertEqual(response.data["value"], "loremipsum")

    def test_update_parameters(self):
        with self.subTest("correctly update a parameter"):
            response = self.client_put(self.url("fake-parameter-1"), {"value": 123})
            self.assertResponseOk(response)
            self.assertEqual(response.data["value"], 123)

            response = self.client_patch(self.url("fake-parameter-1"), {"value": 321})
            self.assertResponseOk(response)
            self.assertEqual(response.data["value"], 321)

            response = self.client_patch(self.url("fake-parameter-2"), {"value": None})
            self.assertResponseOk(response)
            self.assertEqual(response.data["value"], None)

        with self.subTest("attempt a schema-incompatible update"):
            response = self.client_put(self.url("fake-parameter-2"), {"value": ""})
            self.assertResponseStatus(400, response)

            response = self.client_put(self.url("fake-parameter-1"), {"value": "not a number"})
            self.assertResponseStatus(400, response)

        with self.subTest("get parameter history"):
            # generate some history
            self.as_authority()
            self.client_put(self.url("fake-parameter-3"), {"value": {"thing": "foo"}})
            self.client_put(self.url("fake-parameter-3"), {"value": {"stuff": 123}})
            self.client_put(self.url("fake-parameter-3"), {"value": {"thing": "bar", "stuff": 321}})
            self.as_mine()
            self.client_put(self.url("fake-parameter-3"), {"value": None})
            self.client_put(self.url("fake-parameter-3"), {"value": {"thing": "lorem", "stuff": 0}})

            # expect it in reverse order
            response = self.client_get(self.url("fake-parameter-3", "history"))
            self.assertResponseOk(response)
            self.assertEqual(
                [p["user"]["username"] for p in response.data],
                [*((self.mine_user["username"],) * 2), *((self.authority_user["username"],) * 3)]
            )
            self.assertEqual(
                [p["value"] for p in response.data],
                [
                    {"thing": "lorem", "stuff": 0},
                    None,
                    {"thing": "bar", "stuff": 321},
                    {"stuff": 123},
                    {"thing": "foo"}
                ]
            )
