from etl.models import ETLOperation
from api.tests.base import BaseTestCase


class TestDeleteETLOperationsCommand(BaseTestCase):

    def test_error_deduplication(self):
        operation = ETLOperation.objects.create(
            target=self.target_object,
            executor="nothing",
        )
        operation.add_error({"code": "asdf", "message": "bar", "baz": {"omg": [1, 2, 3], "hey": "nothing"}})
        operation.save()
        operation.add_error({"code": "asdf", "message": "different"})
        operation.save()
        operation.add_error({"code": "asdf", "baz": {"omg": [1, 2, 3], "hey": "nothing"}, "message": "bar"})
        operation.save()
        self.assertEqual(len(operation.errors), 2)
