import os
import secrets
import tempfile
from pathlib import Path

from django.core import management

from api.tests.base import BaseTestCase
from targets.models import Target, Camera


class TestLoadDataSourcesCommand(BaseTestCase):

    def create_file(self, contents):
        fd, path = tempfile.mkstemp(suffix=".yml", text=True)
        os.close(fd)
        file = Path(path)
        self.files = [*getattr(self, "files", ()), file]
        with open(file, "w") as f:
            f.write(contents)
        return file

    def cameras_file(self, targets, count):
        cameras = ['cameras:']
        for t in targets:
            for i in range(count):
                cameras.extend([
                    f'  - name: test_camera{i}{secrets.token_urlsafe(4)}',
                    f'    target: {t.canonical_name}',
                    f'    label: Test camera {i}'
                ])
        return '\n'.join(cameras)

    def test_config_file(self):
        targets = Target.objects.all()[:2]
        cameras_config_file = self.create_file(self.cameras_file(targets, 2))
        self.assertEqual(Camera.objects.count(), 0)
        management.call_command(
            "loadcameras",
            str(cameras_config_file),
        )
        self.assertEqual(Camera.objects.count(), 4)
        self.assertEqual(Camera.objects.filter(target=targets[0]).count(), 2)
        self.assertEqual(Camera.objects.filter(target=targets[1]).count(), 2)
        for camera in Camera.objects.all():
            self.assertTrue(camera.label.startswith('Test camera '))
            self.assertTrue(camera.name.startswith('test_camera'))

    def tearDown(self):
        for f in getattr(self, "files", ()):
            f.unlink()
