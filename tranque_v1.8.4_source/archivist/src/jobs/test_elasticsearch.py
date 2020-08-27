import datetime
import json
import random
import secrets

import jobs.elasticsearch


def test_check_validates_testing_environment(settings):
    jobs.elasticsearch.check()


def test_backup_empty_database_works(sandbox, settings):
    jobs.elasticsearch.backup(sandbox, "test-backup-id")


def test_restore_empty_database_works(sandbox, settings):
    with open(sandbox / "templates-test-backup-id.json", "w") as templates_file:
        templates_file.write("{}")
    jobs.elasticsearch.restore(sandbox, "test-backup-id")


def test_backup_and_restore_works(sandbox, elasticsearch_templates):
    # Insert some objects into elasticsearch: 250 for each template,
    # distributed in three indices each
    data = [
        [(
            f"test-{'delete' if index % 30 == 0 else 'keep'}-{secrets.token_hex(4)}",
            datetime.datetime.utcfromtimestamp(random.randint(0, 2 ** 31)).isoformat(),
            random.random()
        ) for index in range(250)]
        for _ in elasticsearch_templates
    ]
    for index, (prefix, _) in enumerate(elasticsearch_templates):
        jobs.elasticsearch._client().bulk(
            body=[
                nested
                for pair in (
                    (
                        {"index": {"_index": f"{prefix}{iv % 3}"}},
                        {
                            "value": value,
                            "name": name,
                            "@timestamp": ts,
                        }
                    )
                    for iv, (name, ts, value) in enumerate(data[index])
                )
                for nested in pair
            ],
            refresh="true"
        )
    # Perform a backup
    jobs.elasticsearch.backup(sandbox, "test-backup-id")
    # Assert the backup's state
    for index, (_, name) in enumerate(elasticsearch_templates):
        with open(sandbox / f"elasticsearch-{name}-test-backup-id.ndjson") as data_file:
            backup_data = [
                (entry["name"], entry["@timestamp"], entry["value"])
                for entry in (
                    json.loads(line)["_source"]
                    for line in data_file.readlines()
                )
            ]
        assert set(backup_data) == set(data[index])
    # Assert values marked with a 'delete' label are still present
    assert jobs.elasticsearch._client().search(
        body={"query": {"regexp": {"name": "test-delete-.*"}}},
        index=",".join(f"{prefix}*" for prefix, _ in elasticsearch_templates),
    )["hits"]["total"]["value"] > 0
    # Delete events from elasticsearch that are marked 'delete' in their name
    jobs.elasticsearch._client().delete_by_query(
        body={"query": {"regexp": {"name": "test-delete-.*"}}},
        refresh="true",
        index=",".join(f"{prefix}*" for prefix, _ in elasticsearch_templates),
    )
    # Assert the values were deleted
    assert jobs.elasticsearch._client().search(
        body={"query": {"regexp": {"name": "test-delete-.*"}}},
        index=",".join(f"{prefix}*" for prefix, _ in elasticsearch_templates),
    )["hits"]["total"]["value"] == 0
    # Add an extra value and assert its presence
    jobs.elasticsearch._client().index(
        index=f"{next(iter(elasticsearch_templates))[0]}-extra",
        body={
            "value": 3.1415,
            "name": "extra-to-test-restoration",
            "@timestamp": "2000-01-01T00:00:00Z"
        },
        refresh="true",
    )
    assert jobs.elasticsearch._client().search(
        body={"query": {"term": {"name": "extra-to-test-restoration"}}},
        index=",".join(f"{prefix}*" for prefix, _ in elasticsearch_templates),
    )["hits"]["total"]["value"] == 1
    # Perform a restore with purge option
    jobs.elasticsearch.restore(sandbox, "test-backup-id", purge=True)
    # Assert the values marked with a 'delete' label are again present
    assert jobs.elasticsearch._client().search(
        body={"query": {"regexp": {"name": "test-delete-.*"}}},
        index=",".join(f"{prefix}*" for prefix, _ in elasticsearch_templates),
    )["hits"]["total"]["value"] > 0
    # Assert the extra value dissappeared
    assert jobs.elasticsearch._client().search(
        body={"query": {"term": {"name": "extra-to-test-restoration"}}},
        index=",".join(f"{prefix}*" for prefix, _ in elasticsearch_templates),
    )["hits"]["total"]["value"] == 0
    # Add the extra value again and assert its presence
    jobs.elasticsearch._client().index(
        index=f"{next(iter(elasticsearch_templates))[0]}-extra",
        body={
            "value": 3.1415,
            "name": "extra-to-test-restoration",
            "@timestamp": "2000-01-01T00:00:00Z"
        },
        refresh="true",
    )
    assert jobs.elasticsearch._client().search(
        body={"query": {"term": {"name": "extra-to-test-restoration"}}},
        index=",".join(f"{prefix}*" for prefix, _ in elasticsearch_templates),
    )["hits"]["total"]["value"] == 1
    # Perform a restore without purging
    jobs.elasticsearch.restore(sandbox, "test-backup-id", purge=False)
    # Assert the extra value still exists
    assert jobs.elasticsearch._client().search(
        body={"query": {"term": {"name": "extra-to-test-restoration"}}},
        index=",".join(f"{prefix}*" for prefix, _ in elasticsearch_templates),
    )["hits"]["total"]["value"] == 1
