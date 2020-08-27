import sys
from pathlib import Path

import yaml
from django.conf import settings
from django.core.management.base import BaseCommand

from targets.models import Target, Camera


class Command(BaseCommand):
    help = "Loads target cameras from a YAML-formatted file"

    def load_data(self, data_file):
        if not data_file or data_file == "-":
            return yaml.load(sys.stdin, Loader=yaml.FullLoader)
        filepath = Path(data_file)
        if not filepath.is_absolute():
            filepath = Path(settings.BASE_DIR) / filepath
        with open(filepath) as f:
            return yaml.load(f, Loader=yaml.FullLoader)

    def add_arguments(self, parser):
        parser.add_argument("file", nargs="?", help="Path to the YAML data file (stdin if omitted or '-')")

    def handle(self, *args, **kwargs):
        verbosity = kwargs.get("verbosity", 1)

        cameras = self.load_data(kwargs.get("file")).get('cameras', [])

        for camera_data in cameras:
            target = Target.objects.get(canonical_name=camera_data['target'])
            camera = Camera.objects.filter(target=target, name=camera_data['name']).first()
            if camera is not None:
                if verbosity > 0:
                    self.stdout.write(f"Camera {camera.name}:{target.canonical_name} already exists")
                continue
            else:
                camera = Camera.objects.create(
                    target=target,
                    name=camera_data['name'],
                    label=camera_data['label'],
                )
            if verbosity > 0:
                self.stdout.write(f"Camera {camera.name}:{target.canonical_name} created")
