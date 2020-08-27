#!/usr/bin/env python
import json
import logging
from pathlib import Path
import time

import click

from conf import settings
import jobs.elasticsearch
import jobs.postgres
import jobs.storage
import sync
import utils

logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO),
    format="[{levelname}] [{name}] {message}",
    style="{",
)

# The backup and restore jobs
JOBS = (
    jobs.elasticsearch,
    jobs.postgres,
    jobs.storage,
)


@click.group()
def main():
    "Entrypoint for all archivist commands."
    pass


@main.command()
def info():
    """Prints all configuration options and exits. This will expose
    sensitive credentials.

    """
    click.echo(json.dumps({
        **settings.as_serializable_dict(),
        "JOBS": [j.__name__ for j in JOBS]
    }, indent=2))


def _parse_job_vararg(job):
    jobs = set(job)
    specified_jobs = JOBS if not jobs else [j for j in JOBS if j.__name__ in jobs]
    if len(jobs) > len(specified_jobs):
        unmatched = jobs - set(j.__name__ for j in JOBS)
        raise click.ClickException(f"unknown jobs: {unmatched}")
    return specified_jobs


def _core_check(job):
    specified_jobs = _parse_job_vararg(job)
    service = "none"
    try:
        for job in specified_jobs:
            service = job.__name__
            job.check()
    except Exception:
        raise click.ClickException(f"{service} service is not reachable with current configuration")


@main.command()
@click.argument("job", nargs=-1)
def simple_check(job):
    """Checks whether configuration is enough to run simple backup and
    restoration commands. If specified, only the given jobs are
    checked.

    """
    _core_check(job)
    click.echo("Everything is ready")


@main.command()
@click.argument("job", nargs=-1)
def check(job):
    """Checks whether configuration is enough to run backup or restoration
    commands. If specified, only the given jobs are checked.

    """
    _core_check(job)
    try:
        sync.check()
    except Exception:
        raise click.ClickException("sync service is not reachable with current configuration")
    click.echo("Everything is ready")


@main.command()
@click.argument("target", type=click.Path(exists=True, file_okay=False, dir_okay=True, resolve_path=True))
@click.argument("job", nargs=-1)
def simple_backup(target, job):
    """Performs a system backup but leaves the bundle in a file, instead
    of uploading it to the backups repository. If specified, only the
    given backup jobs are performed.

    """
    specified_jobs = _parse_job_vararg(job)
    with utils.sandbox() as base:
        bundle, bundle_id = sync.make_bundle(base)
        meta = {"archivist": settings.CI_ENV, "stats": {}}
        for job in specified_jobs:
            job_root = Path(bundle / job.__name__)
            job_root.mkdir()
            start = time.perf_counter()
            job.backup(job_root, bundle_id)
            end = time.perf_counter()
            meta["stats"][job.__name__] = {"time_seconds": end - start}
        with open(bundle / "meta.json", "w") as meta_file:
            json.dump(meta, meta_file, indent=2)
        sync.simple_save(bundle, Path(target) / f"{bundle.name}.tgz")
        click.echo(f"Backup complete. Backup is {bundle.name}.tgz")


@main.command()
@click.argument("job", nargs=-1)
def backup(job):
    """Performs a full system backup. If specified, only the given backup
    jobs are performed.

    """
    specified_jobs = _parse_job_vararg(job)
    with utils.sandbox() as base:
        bundle, bundle_id = sync.make_bundle(base)
        meta = {"archivist": settings.CI_ENV, "stats": {}}
        for job in specified_jobs:
            job_root = Path(bundle / job.__name__)
            job_root.mkdir()
            start = time.perf_counter()
            job.backup(job_root, bundle_id)
            end = time.perf_counter()
            meta["stats"][job.__name__] = {"time_seconds": end - start}
        with open(bundle / "meta.json", "w") as meta_file:
            json.dump(meta, meta_file, indent=2)
        sync.save(bundle)
        click.echo(f"Backup complete. Backup ID is {bundle_id}")


@main.command()
def list():
    "Shows a list of available backups."
    with utils.sandbox() as base:
        backups = sync.get_backups(base)
    if not backups:
        click.echo(f"No backups available")
    else:
        headers = backups[0].keys()
        paddings = {
            k: max(len(k), max(len(backup[k]) for backup in backups))
            for k in headers
        }
        click.echo("  ".join(
            f"{h}{(paddings[h] - len(h)) * ' '}"
            for h in headers
        ))
        for backup in backups:
            click.echo("  ".join(
                f"{backup[h]}{(paddings[h] - len(backup[h])) * ' '}"
                for h in headers
            ))


def _restore(bundle, bundle_id, specified_jobs, purge):
    "Performs the compound restore operation."
    jobs, missing = [], []
    for job in specified_jobs:
        (jobs if Path(bundle / job.__name__).is_dir() else missing).append(job)
    if missing:
        click.echo(f"Backup doesn't include entries for {', '.join(map(str, missing))}")
    for job in reversed(jobs):
        click.echo(f"Starting {job.__name__} restore")
        job_root = Path(bundle / job.__name__)
        job.restore(job_root, bundle_id, purge=purge)
    click.echo("Restore complete")


@main.command()
@click.option(
    "-y",
    "--yes",
    "auto_confirm",
    is_flag=True,
    help="Automatically confirm the restore operation",
)
@click.option(
    "--purge",
    "purge",
    is_flag=True,
    help="For jobs that support it, perform a 'purge' before the restoration",
)
@click.argument("archive", type=click.Path(exists=True, dir_okay=False, readable=True))
@click.argument("job", nargs=-1)
def simple_restore(auto_confirm, purge, archive, job):
    """Performs a full system restore, given a backup archive.

    Optional job names can be given to only consider those for the
    restoration. Valid job names are the module names of JOBS.

    """
    specified_jobs = _parse_job_vararg(job)
    if auto_confirm:
        click.echo("Running restore with pre-confirmation")
    else:
        click.confirm(
            "This will perform a full system restore, "
            "destroying or altering the current state of "
            "the stack. Do you want to continue?",
            abort=True,
        )
    with utils.sandbox() as base:
        bundle, bundle_id = sync.simple_load(base, archive)
        _restore(bundle, bundle_id, specified_jobs, purge)


@main.command()
@click.option(
    "-y",
    "--yes",
    "auto_confirm",
    is_flag=True,
    help="Automatically confirm the restore operation",
)
@click.option(
    "--purge",
    "purge",
    is_flag=True,
    help="For jobs that support it, perform a 'purge' before the restoration",
)
@click.argument("backup_key")
@click.argument("job", nargs=-1)
def restore(auto_confirm, purge, backup_key, job):
    """Performs a full system restore, given a backup key name.

    Optional job names can be given to only consider those for the
    restoration. Valid job names are the module names of JOBS.

    The specific backup_key 'latest' is an alias for the latest backup
    available.

    """
    specified_jobs = _parse_job_vararg(job)
    if auto_confirm:
        click.echo("Running restore with pre-confirmation")
    else:
        click.confirm(
            "This will perform a full system restore, "
            "destroying or altering the current state of "
            "the stack. Do you want to continue?",
            abort=True,
        )
    with utils.sandbox() as base:
        try:
            bundle, bundle_id = sync.load(base, backup_key)
            _restore(bundle, bundle_id, specified_jobs, purge)
        except ValueError as e:
            raise click.ClickException(*e.args)


if __name__ == "__main__":
    main()
