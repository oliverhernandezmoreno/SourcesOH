import os
import secrets
from functools import wraps
from pathlib import Path

from PIL import Image
from django.conf import settings
from django.core.files.storage import default_storage

from documents.models import Document


def with_fake_docs(count=0):
    def _decorator(method):
        @wraps(method)
        def wrapped(self, *args, **kwargs):
            documents = []
            tmpdir = settings.MEDIA_ROOT
            for i in range(count):
                name = f'{i}-{secrets.token_urlsafe(8)}.fake'
                path = str(Path(tmpdir) / name)
                with default_storage.open(path, mode='w+') as fake_file:
                    fake_file.write(f'fake content for file {i}\n{secrets.token_urlsafe(24)}')
                documents.append(
                    Document.objects.create(
                        folder='',
                        file=path,
                        name=name,
                    )
                )
            return method(self, *args, documents, **kwargs)

        return wrapped

    return _decorator


def with_fake_images(count=0):
    def _decorator(method):
        @wraps(method)
        def wrapped(self, *args, **kwargs):
            image_paths = []
            tmpdir = settings.MEDIA_ROOT
            for i in range(count):
                name = f'{i}-{secrets.token_urlsafe(8)}.fake.png'
                path = str(Path(tmpdir) / name)
                with default_storage.open(path, mode='wb') as fake_image:
                    img = Image.new('RGB', (64, 64), (255, 255, 255))
                    img.save(fake_image, "PNG")
                image_paths.append(path)
            return method(self, *args, image_paths, **kwargs)

        return wrapped

    return _decorator


def mock_download_file(key, to_path):
    if settings.DEFAULT_FILE_STORAGE == 'django.core.files.storage.FileSystemStorage':
        to_path_dir = '/'.join(to_path.split('/')[:-1])
        full_path = str(Path(settings.MEDIA_ROOT) / to_path_dir)
        os.makedirs(str(full_path), exist_ok=True)
    if key == to_path:
        return True
    with default_storage.open(key, mode='rb') as from_file:
        with default_storage.open(to_path, mode='wb') as to_file:
            to_file.write(from_file.read())
    return True
