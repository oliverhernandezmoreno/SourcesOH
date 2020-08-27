import contextlib
from functools import reduce
import json
import os
from pathlib import Path

# General settings

BASE_PATH = Path(__file__).parent.parent
LOG_LEVEL = os.environ.get("LOG_LEVEL", "info")
BACKUPS_KEPT = max(int(os.environ.get("BACKUPS_KEPT", "30")), 7)
PATH = os.environ.get("PATH")
LANG = os.environ.get("LANG")
with open(BASE_PATH / "ci-env.json") as ci_env_file:
    CI_ENV = json.load(ci_env_file)

# Postgres

DATABASE_NAME = os.environ.get("DATABASE_NAME", "backend")
DATABASE_HOST = os.environ.get("DATABASE_HOST", "localhost")
DATABASE_USER = os.environ.get("DATABASE_USER", "backend")
DATABASE_PASSWORD = os.environ.get("DATABASE_PASSWORD", "backend")
DATABASE_PORT = os.environ.get("DATABASE_PORT", "5432")

# Elasticsearch

ELASTICSEARCH_PROTOCOL = os.environ.get("ELASTICSEARCH_PROTOCOL", "http")
ELASTICSEARCH_HOST = os.environ.get("ELASTICSEARCH_HOST", "localhost")
ELASTICSEARCH_PORT = os.environ.get("ELASTICSEARCH_PORT", "9200")
ELASTICSEARCH_USER = os.environ.get("ELASTICSEARCH_USER")
ELASTICSEARCH_PASSWORD = os.environ.get("ELASTICSEARCH_PASSWORD", "")
ELASTICSEARCH_BULK_KWARGS = {}

# MinIO

S3_ACCESS_KEY_ID = os.environ.get("S3_ACCESS_KEY_ID")
S3_SECRET_ACCESS_KEY = os.environ.get("S3_SECRET_ACCESS_KEY")
S3_BUCKET_NAME = os.environ.get("S3_BUCKET_NAME")
S3_ENDPOINT_URL = os.environ.get("S3_ENDPOINT_URL")

# Target bucket

BACKUP_ACCESS_KEY_ID = os.environ.get("BACKUP_ACCESS_KEY_ID")
BACKUP_SECRET_ACCESS_KEY = os.environ.get("BACKUP_SECRET_ACCESS_KEY")
BACKUP_BUCKET_NAME = os.environ.get("BACKUP_BUCKET_NAME")
BACKUP_ENDPOINT_URL = os.environ.get("BACKUP_ENDPOINT_URL")
NAMESPACE = os.environ.get("NAMESPACE", "global-namespace")


class Settings:

    def __init__(self):
        self._frozen = {
            k: v
            for k, v in globals().items()
            if k.isupper()
        }
        self._overrides = []

    def as_dict(self):
        return dict(
            self._frozen,
            **reduce(
                lambda merged, overrides: dict(merged, **overrides),
                self._overrides,
                {},
            ),
        )

    def as_serializable_dict(self):
        def serialize(v):
            if isinstance(v, dict):
                return {k: serialize(subv) for k, subv in v.items()}
            if isinstance(v, (list, tuple)):
                return [serialize(subv) for subv in v]
            if isinstance(v, (int, float)):
                return v
            return str(v)

        return serialize(self.as_dict())

    def __getattr__(self, key):
        return self.as_dict()[key]

    @contextlib.contextmanager
    def overrides(self, **kwargs):
        self._overrides.append(kwargs)
        yield self
        self._overrides.pop()


settings = Settings()
