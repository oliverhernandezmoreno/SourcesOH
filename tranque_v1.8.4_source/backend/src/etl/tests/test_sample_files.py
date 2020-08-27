from pathlib import Path

from django.conf import settings
from django.core.files.storage import default_storage

from etl.models import get_executors, ETLOperation
from etl.tests.base import ETLBase
from targets.models import DataSourceGroup


class SampleFilesTestCase(ETLBase):
    BASE_DIR = Path(__file__).parent.parent / "static"

    def setUp(self):
        # add required group for EMAC executors
        DataSourceGroup.objects.create(
            canonical_name="monitoreo-aguas",
            name="Monitoreo de aguas",
            target=self.target_object,
        )

    def test_get_executors_is_not_empty(self):
        self.assertGreater(len(list(get_executors())), 0)

    def test_sample_files_exist(self):
        for executor in get_executors():
            for sample_file in executor.sample_files:
                assert (self.BASE_DIR / sample_file).exists(), f"{sample_file} doesn't exist"

    def test_sample_files_reach_conform_empty(self):
        for executor in get_executors():
            for sample_file in executor.sample_files:
                safe_path = str(Path(settings.MEDIA_ROOT) / Path(sample_file).name)
                sample_path = str(self.BASE_DIR / sample_file)
                with open(sample_path, mode='rb') as src, default_storage.open(safe_path, mode='wb') as dst:
                    dst.write(src.read())
                operation = ETLOperation.start(
                    executor.executor,
                    self.superuser_object,
                    self.target_object,
                    self.make_datafile(safe_path),
                    {}
                )
                self.assertFalse(operation.deliverable)
                self.assertEqual(operation.state, ETLOperation.ETLState.CONFORM, repr(operation.errors))
                self.assertEqual(operation.conformed_values.count(), 0)
