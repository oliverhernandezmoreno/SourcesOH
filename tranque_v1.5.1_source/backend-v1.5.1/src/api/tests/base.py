import json
import logging
import os
import secrets
import shutil
import tempfile
import warnings
from functools import partial
from pathlib import Path

import boto3
from django.conf import settings
from django.contrib.auth import get_user_model
from django.core import management
from django.test.runner import DiscoverRunner
from elasticsearch import Elasticsearch
from rest_framework import test
from rest_framework.authtoken.models import Token

logger = logging.getLogger(__name__)


def _send_json(source, verb):
    def helper(self, *args, **kwargs):
        return getattr(getattr(self, source), verb)(
            *args,
            **{"format": "json", **kwargs}
        )

    helper.__name__ = f"{source}_{verb}"
    return helper


class BaseTestCase(test.APITestCase):
    superuser = {
        "username": "superuser",
        "password": "superpassword",
    }

    internal_user = {
        "username": "internaluser",
        "token": "f8489fc994954c9858cb52d80363b2c20357f06a"
    }

    authority_user = {
        "username": "big-boss",
        "password": "big-boss-password",
    }

    mine_user = {
        "username": "miner",
        "password": "miner-password",
    }

    target = "desconocido-illapel"

    def setUp(self):
        super().setUp()
        self.request = test.APIRequestFactory()

    @property
    def api_version(self):
        module = type(self).__module__
        return (
            module[module.index("api.") + 4:].split(".", 1)[0]
            if module.startswith("src.api.") or module.startswith("api.")
            else "dev"
        )

    @property
    def target_object(self):
        from targets.models import Target
        return Target.objects.get(canonical_name=self.target)

    @property
    def superuser_object(self):
        return get_user_model().objects.get(username=self.superuser["username"])

    @property
    def internal_user_object(self):
        return get_user_model().objects.get(username=self.internal_user["username"])

    @property
    def authority_user_object(self):
        return get_user_model().objects.get(username=self.authority_user["username"])

    @property
    def mine_user_object(self):
        return get_user_model().objects.get(username=self.mine_user["username"])

    client_get = _send_json("client", "get")
    client_post = _send_json("client", "post")
    client_put = _send_json("client", "put")
    client_patch = _send_json("client", "patch")

    request_get = _send_json("request", "get")
    request_post = _send_json("request", "post")
    request_put = _send_json("request", "put")
    request_patch = _send_json("request", "patch")

    def as_internal(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.internal_user['token']}")

    def as_superuser(self):
        token, _ = Token.objects.get_or_create(user=self.superuser_object)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")

    def as_authority(self):
        token, _ = Token.objects.get_or_create(user=self.authority_user_object)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")

    def as_mine(self):
        token, _ = Token.objects.get_or_create(user=self.mine_user_object)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")

    def as_user(self, user):
        token, _ = Token.objects.get_or_create(user=user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")

    def assertResponseOk(self, response):
        self.assertTrue(
            200 <= response.status_code < 300,
            f"status is {response.status_code}: {getattr(response, 'data', None)}",
        )

    def assertResponseStatus(self, status, response):
        self.assertEqual(status, response.status_code, response.content)


def baseSetUp():
    logger.debug("Loading zones")
    management.call_command(
        "loadzones",
        verbosity=0,
    )
    logger.debug("Loading targets")
    management.call_command(
        "loadtargets",
        Path(settings.BASE_DIR) / "targets/management/commands/data/depositosTest.xls",
        verbosity=0,
    )
    logger.debug("Tallying targets")
    management.call_command(
        "tallytargets",
        verbosity=0,
    )
    logger.debug("Loading data sources")
    management.call_command(
        "loaddatasources",
        "targets/management/commands/data/fake-datasources",
        BaseTestCase.target,
        verbosity=0,
    )
    logger.debug("Asserting superuser")
    management.call_command(
        "assertsuperuser",
        BaseTestCase.superuser["username"],
        BaseTestCase.superuser["password"],
        verbosity=0,
    )
    logger.debug("Asserting credentials")
    management.call_command(
        "assertcredentials",
        BaseTestCase.internal_user["username"],
        BaseTestCase.internal_user["token"],
        verbosity=0,
    )
    logger.debug("Loading authority and mine user groups")
    management.call_command(
        "loaddata",
        Path(settings.BASE_DIR) / "fixtures/groups.json",
        verbosity=0,
    )
    logger.debug("Loading system user")
    management.call_command(
        "loaddata",
        Path(settings.BASE_DIR) / "fixtures/system_user.json",
        verbosity=0,
    )
    with tempfile.NamedTemporaryFile("w") as profiles:
        profiles.write(f"""
- username: {BaseTestCase.authority_user['username']}
  password: {BaseTestCase.authority_user['password']}
  group: authority

- username: {BaseTestCase.mine_user['username']}
  password: {BaseTestCase.mine_user['password']}
  group: mine
  targets:
    - {BaseTestCase.target}
        """)
        profiles.flush()
        management.call_command(
            "loadprofiles",
            profiles.name,
            verbosity=0,
        )
        management.call_command(
            "createcurrentremote",
            verbosity=0,
        )


def baseTearDown():
    management.call_command("flush", interactive=False)


def setup_elasticsearch_test_template():
    with open(Path(settings.BASE_DIR) / "test-elasticsearch-template.json") as f:
        template = json.load(f)
    Elasticsearch(f'{settings.ELASTICSEARCH_HOST}:{settings.ELASTICSEARCH_PORT}').indices.put_template(
        name="test-timeseries",
        body=template
    )


def remove_elasticsearch_test_indices():
    Elasticsearch(f'{settings.ELASTICSEARCH_HOST}:{settings.ELASTICSEARCH_PORT}').indices.delete("test-*")


def remove_test_bucket():
    if not settings.STORAGE_IS_S3:
        return
    try:
        bucket = boto3.resource(
            "s3",
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            endpoint_url=settings.AWS_S3_ENDPOINT_URL,
        ).Bucket(settings.AWS_STORAGE_BUCKET_NAME)
        bucket.objects.all().delete()
        bucket.delete()
    except Exception:
        logger.error(f"Couldn't remove test bucket {settings.AWS_STORAGE_BUCKET_NAME}")


class TestRunner(DiscoverRunner):

    def setup_test_environment(self, **kwargs):
        super().setup_test_environment(**kwargs)
        self._original_media_root = settings.MEDIA_ROOT
        self._tmp_media = tempfile.mkdtemp()
        settings.MEDIA_ROOT = self._tmp_media
        logger.info(f"MEDIA_ROOT set to {settings.MEDIA_ROOT} during tests")
        if "DEFAULT_FILE_STORAGE" not in os.environ:
            self._original_storage = settings.DEFAULT_FILE_STORAGE
            settings.DEFAULT_FILE_STORAGE = 'django.core.files.storage.FileSystemStorage'
            logger.info(f"DEFAULT_FILE_STORAGE set to {settings.DEFAULT_FILE_STORAGE} during tests")
        self._original_bucket_name = settings.AWS_STORAGE_BUCKET_NAME
        settings.AWS_STORAGE_BUCKET_NAME = f"test-bucket-{secrets.token_hex(4)}"
        # patch django.core.management.call_command to always include verbosity=0
        self._call_command = management.call_command
        management.call_command = partial(management.call_command, verbosity=0)
        # disable all warnings
        warnings.filterwarnings("ignore", append=True)

    def setup_databases(self, *args, **kwargs):
        config = super().setup_databases(**kwargs)
        baseSetUp()
        setup_elasticsearch_test_template()
        remove_elasticsearch_test_indices()
        return config

    def teardown_test_environment(self, **kwargs):
        super().teardown_test_environment(**kwargs)
        shutil.rmtree(self._tmp_media, ignore_errors=True)
        settings.MEDIA_ROOT = self._original_media_root
        if hasattr(self, "_original_storage"):
            settings.DEFAULT_FILE_STORAGE = self._original_storage
        settings.AWS_STORAGE_BUCKET_NAME = self._original_bucket_name
        management.call_command = self._call_command
        warnings.filters.pop()

    def teardown_databases(self, old_config, **kwargs):
        baseTearDown()
        remove_elasticsearch_test_indices()
        remove_test_bucket()
        return super().teardown_databases(old_config, **kwargs)


class RollbackException(Exception):
    pass
