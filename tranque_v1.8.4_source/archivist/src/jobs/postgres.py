import logging

from conf import settings
import utils

logger = logging.getLogger(__name__)


def _pg_command(*args, **kwargs):
    return utils.command(
        *args,
        *(
            "-h", settings.DATABASE_HOST,
            "-U", settings.DATABASE_USER,
            "-p", settings.DATABASE_PORT,
            "-w",
        ),
        **{
            **kwargs,
            "env": {
                **kwargs.get("env", {}),
                "PGPASSWORD": settings.DATABASE_PASSWORD,
            },
        },
    )


def check():
    """Checks whether a connection to postgres can be established.

    """
    return _pg_command(
        "psql",
        "-q",
        "-c", "SELECT 1;",
        "-d", settings.DATABASE_NAME,
    )


def backup(base, id):
    """Performs a backup of the postgres database, through the pg_dump
    utility.

    """
    logger.info("Dumping postgres database")
    return _pg_command(
        "pg_dump",
        "-f", str(base / f"postgres-{id}.sql"),
        "-d", settings.DATABASE_NAME,
    )


def restore(base, id, purge=False):
    """Performs a restore operation, expecting a 'postgres' file. The
    restoration is done in three steps: dumping the contents of the
    file into a secondary database, renaming the current one to a
    'to-be-deleted' name, and renaming the secondary database to match
    the previous' name.

    The *purge* flag is ignored. This operation always purges the
    previous database. TODO: perform a merge-like restoration when
    purge=False.

    """
    # Create a temporary database to hold the incoming backup
    logger.info(f"Creating temporary restoration database: restoration-{id}")
    _pg_command(
        "psql",
        "-q",
        "-c", f'CREATE DATABASE "restoration-{id}"',
        "-d", "postgres",
    )
    # Restore to the newly created database
    logger.info("Restoring data to temporary database")
    _pg_command(
        "psql",
        "-q",
        "-v", "ON_ERROR_STOP=on",
        "-f", str(base / f"postgres-{id}.sql"),
        "-d", f"restoration-{id}",
    )

    suffix = "_tobedeleted"
    logger.info("Terminating connections and replacing current database")
    _pg_command(
        "psql",
        "-q",
        "-v", "ON_ERROR_STOP=on",
        "-c", " ".join((
            # terminate connections
            "SELECT pg_terminate_backend(pid)",
            "FROM pg_stat_activity",
            f"WHERE pid <> pg_backend_pid() AND datname = '{settings.DATABASE_NAME}';",
            # rename current db
            f'ALTER DATABASE "{settings.DATABASE_NAME}" RENAME TO "{settings.DATABASE_NAME}{suffix}";',
            # replace db with restoration
            f'ALTER DATABASE "restoration-{id}" RENAME TO "{settings.DATABASE_NAME}";',
        )),
        "-d", "postgres",
    )
    # delete old db
    _pg_command(
        "psql",
        "-q",
        "-c", f'DROP DATABASE IF EXISTS "{settings.DATABASE_NAME}{suffix}";',
        "-d", "postgres",
    )
