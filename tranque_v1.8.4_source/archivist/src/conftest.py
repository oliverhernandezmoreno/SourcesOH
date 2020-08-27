import contextlib
import functools
import json
import os
import secrets

import pytest

import conf
import jobs.postgres
import jobs.elasticsearch
import utils


@pytest.fixture
def sandbox():
    "Provide a temporary directory."
    with utils.sandbox() as base:
        yield base


@functools.lru_cache()
def test_overrides():
    with open(conf.settings.BASE_PATH / (
            "ci-test-env.json"
            if os.getenv("CI")
            else "test-env.json"
    )) as f:
        return json.load(f)


@pytest.fixture
def settings():
    "Override settings with test settings."
    with conf.settings.overrides(**test_overrides()) as s:
        yield s


@contextlib.contextmanager
def temporary_bucket(prefix, credentials):
    bucket = f"{prefix}-{secrets.token_hex(4)}"
    utils.command(
        "aws",
        "--endpoint-url", credentials["ENDPOINT_URL"],
        "s3", "mb", f"s3://{bucket}",
        env={
            "AWS_ACCESS_KEY_ID": credentials["ACCESS_KEY_ID"],
            "AWS_SECRET_ACCESS_KEY": credentials["SECRET_ACCESS_KEY"],
        },
    )
    yield bucket
    utils.command(
        "aws",
        "--endpoint-url", credentials["ENDPOINT_URL"],
        "s3", "rb", f"s3://{bucket}", "--force",
        env={
            "AWS_ACCESS_KEY_ID": credentials["ACCESS_KEY_ID"],
            "AWS_SECRET_ACCESS_KEY": credentials["SECRET_ACCESS_KEY"],
        },
    )


@pytest.fixture
def backup_bucket(settings):
    "Provide a fresh bucket for the 'sync' coordinator."
    with temporary_bucket("backup", {
            "ACCESS_KEY_ID": settings.BACKUP_ACCESS_KEY_ID,
            "SECRET_ACCESS_KEY": settings.BACKUP_SECRET_ACCESS_KEY,
            "ENDPOINT_URL": settings.BACKUP_ENDPOINT_URL,
    }) as bucket:
        with conf.settings.overrides(BACKUP_BUCKET_NAME=bucket):
            yield bucket


@pytest.fixture
def s3_bucket(settings):
    "Provide a fresh bucket for the 'storage' job."
    with temporary_bucket("s3", {
            "ACCESS_KEY_ID": settings.S3_ACCESS_KEY_ID,
            "SECRET_ACCESS_KEY": settings.S3_SECRET_ACCESS_KEY,
            "ENDPOINT_URL": settings.S3_ENDPOINT_URL,
    }) as bucket:
        with conf.settings.overrides(S3_BUCKET_NAME=bucket):
            yield bucket


@pytest.fixture
def postgres_database(settings):
    "Provide a fresh database for the 'postgres' job."
    dbname = f"db_{secrets.token_hex(4)}"
    jobs.postgres._pg_command(
        "psql",
        "-q",
        "-c", f'CREATE DATABASE "{dbname}";',
        "-d", "postgres",
    )
    with conf.settings.overrides(DATABASE_NAME=dbname):
        yield dbname
    jobs.postgres._pg_command(
        "psql",
        "-q",
        "-c", f'DROP DATABASE "{dbname}";',
        "-d", "postgres",
    )


@pytest.fixture
def elasticsearch_templates(settings):
    """Provide a fresh set of templates for the 'elasticsearch' job. Each
    template will be given as a strict prefix for indices paired with
    the template's name.

    """
    templates = [
        (prefix, "_".join(prefix.split("-")[0:2]))
        for prefix in (
            f"test-{index}-{secrets.token_hex(4)}-"
            for index in range(1, 6)
        )
    ]
    for prefix, name in templates:
        jobs.elasticsearch._client().indices.put_template(
            name=name,
            body={
                "index_patterns": [f"{prefix}*"],
                "settings": {
                    "index": {
                        "number_of_shards": "1",
                        "number_of_replicas": "0",
                    },
                },
                "mappings": {
                    "dynamic": False,
                    "properties": {
                        "name": {"type": "keyword"},
                        "@timestamp": {"type": "date"},
                        "value": {"type": "double"},
                    },
                },
            },
        )
    yield templates
    for prefix, name in templates:
        jobs.elasticsearch._client().indices.delete(index=f"{prefix}*", ignore=[404])
        jobs.elasticsearch._client().indices.delete_template(name=name)


@pytest.fixture
def full_setup(settings, s3_bucket, postgres_database, elasticsearch_templates, backup_bucket):
    yield settings
