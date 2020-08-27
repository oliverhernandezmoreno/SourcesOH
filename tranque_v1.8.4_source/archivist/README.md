# tranque-archivist

This is a logical backup & restore service for any tranque stack. It
generates logical backups for the PostgreSQL database, the
Elasticsearch database, and the MinIO / AWS S3 object storage
backend. It then packages and uploads the backups to an S3 bucket.

## Usage

This image is to be used in one of three modes:
- As a cronjob (e.g. with the default command)
- As a manual backup & restore execution baseline (e.g. as a binary)
- (TODO) as a backup & restore HTTP service

To configure this image, a set of environment variables is required:
- `BACKUPS_KEPT` with the number of backups to keep in rotation
  (defaults to 30, can't be less than 7)
- `DATABASE_` -prefixed variables, with suffixes `NAME`, `HOST`,
  `USER`, `PASSWORD` and `PORT`, configuration variables for the
  postgres backup job.
- `ELASTICSEARCH_` -prefixed variables, with suffixes `PROTOCOL`,
  `HOST`, `PORT`, `USER`, `PASSWORD` configuration variables for the
  elasticsearch backup job.
- `S3_` -prefixed variables, with suffixes `ACCESS_KEY_ID`,
  `SECRET_ACCESS_KEY`, `BUCKET_NAME`, `ENDPOINT_URL`, configuration
  variables for the storage backup job.
- `BACKUP_` -prefixed variables, with suffixes `ACCESS_KEY_ID`,
  `SECRET_ACCESS_KEY`, `BUCKET_NAME`, `ENDPOINT_URL`, configuration
  variables for the module that stores backups. This corresponds to an
  official or unofficial S3 service.
- `NAMESPACE`, the namespace used for other stack services (e.g. the
  name used for exchanges, which is `global-namespace` for SMCs).
- `CRON_SCHEDULE`, the schedule written in cron syntax for the
  execution of periodic backups (assuming the default entrypoint and
  command). By default it's `0 1 * * *` or "daily".

The commands available all live inside the `archivist` hub. So, to
check them out and read minimal docs, do:

```bash
archivist --help
```

And something like this should appear:

```
Usage: archivist.py [OPTIONS] COMMAND [ARGS]...

  Entrypoint for all archivist commands.

Options:
  --help  Show this message and exit.

Commands:
  backup          Performs a full system backup.
  check           Checks whether configuration is enough to run backup or...
  info            Prints all configuration options and exits.
  list            Shows a list of available backups.
  restore         Performs a full system restore, given a backup key name.
  simple-backup   Performs a system backup but leaves the bundle in a file,...
  simple-check    Checks whether configuration is enough to run simple...
  simple-restore  Performs a full system restore, given a backup archive.
```

## Anatomy of a backup

A backup is a gzipped tar archive of the following structure (an
example extracted from tests):

```
bundle-2019-12-23-qQUXdfPnayQ/
├── jobs.elasticsearch
│   ├── elasticsearch-test_1-qQUXdfPnayQ.ndjson
│   ├── elasticsearch-test_2-qQUXdfPnayQ.ndjson
│   ├── elasticsearch-test_3-qQUXdfPnayQ.ndjson
│   ├── elasticsearch-test_4-qQUXdfPnayQ.ndjson
│   ├── elasticsearch-test_5-qQUXdfPnayQ.ndjson
│   └── templates-qQUXdfPnayQ.json
├── jobs.postgres
│   └── postgres-qQUXdfPnayQ.sql
├── jobs.storage
│   └── storage-qQUXdfPnayQ.tgz
└── meta.json
```

The `jobs.*` folders contain artifacts produced by each backup job,
and the `meta.json` contains information about the backup. For example
(extracted from tests):

```json
{
  "archivist": {
    "CI_COMMIT_MESSAGE": "",
    "CI_COMMIT_REF_NAME": "local",
    "CI_COMMIT_REF_SLUG": "local",
    "CI_COMMIT_SHA": "local",
    "CI_COMMIT_SHORT_SHA": "local",
    "CI_COMMIT_TAG": "",
    "CI_JOB_ID": "",
    "CI_PIPELINE_IID": "",
    "CI_PROJECT_NAME": "archivist",
    "CI_REGISTRY_IMAGE": ""
  },
  "stats": {
    "jobs.elasticsearch": {
      "time_seconds": 0.04139085800125031
    },
    "jobs.postgres": {
      "time_seconds": 0.09807680700032506
    },
    "jobs.storage": {
      "time_seconds": 0.3391406430018833
    }
  }
}
```
