import secrets
import tempfile
from functools import wraps
from pathlib import Path

from django.conf import settings
from django.core.files.storage import default_storage

from documents.models import Document


def with_fake_docs(count=0):
    def _decorator(method):
        @wraps(method)
        def wrapped(self, *args, **kwargs):
            documents = []
            with tempfile.TemporaryDirectory(dir=settings.MEDIA_ROOT) as tmpdir:
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
