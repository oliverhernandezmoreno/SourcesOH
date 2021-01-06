import jobs.postgres
import utils


def test_check_validates_testing_environment(postgres_database):
    jobs.postgres.check()


def test_backup_empty_database_works(sandbox, postgres_database):
    jobs.postgres.backup(sandbox, "test-backup-id")


def test_restore_empty_database_works(sandbox, postgres_database):
    utils.command("touch", str(sandbox / "postgres-test-backup-id.sql"))
    jobs.postgres.restore(sandbox, "test-backup-id")


def test_backup_and_restore_works(sandbox, settings, postgres_database):
    # Create some objects into the database
    jobs.postgres._pg_command(
        "psql",
        "-q",
        "-v", "ON_ERROR_STOP=on",
        "-c", " ".join((
            # create a table
            "CREATE TABLE things (id integer primary key generated by default as identity, description text);",
            # insert some rows
            "INSERT INTO things (description) VALUES ('the first thing ever'), ('a very nice thing indeed');",
        )),
        "-d", settings.DATABASE_NAME,
    )
    # Perform a backup
    jobs.postgres.backup(sandbox, "test-backup-id")
    # Add two row, delete one
    jobs.postgres._pg_command(
        "psql",
        "-q",
        "-v", "ON_ERROR_STOP=on",
        "-c", " ".join((
            "INSERT INTO things (description) VALUES ('a thing of wonders'), ('a thing worth keeping');",
            "DELETE FROM things WHERE id = 2;"
        )),
        "-d", settings.DATABASE_NAME,
    )
    # Assert the current state of the database
    jobs.postgres._pg_command(
        "psql",
        "-q",
        "-t",
        "-v", "ON_ERROR_STOP=on",
        "-c", "SELECT id, description FROM things ORDER BY id ASC;",
        "-d", settings.DATABASE_NAME,
        output=str(sandbox / "test-output"),
    )
    with open(sandbox / "test-output") as out:
        assert [
            line.strip()
            for line in out.readlines()
            if line.strip()
        ] == [
            "1 | the first thing ever",
            "3 | a thing of wonders",
            "4 | a thing worth keeping"
        ]
    # Perform a restore
    jobs.postgres.restore(sandbox, "test-backup-id")
    # Expect the original values, and not the new values
    jobs.postgres._pg_command(
        "psql",
        "-q",
        "-t",
        "-v", "ON_ERROR_STOP=on",
        "-c", "SELECT id, description FROM things ORDER BY id ASC;",
        "-d", settings.DATABASE_NAME,
        output=str(sandbox / "test-output"),
    )
    with open(sandbox / "test-output") as out:
        assert [
            line.strip()
            for line in out.readlines()
            if line.strip()
        ] == [
            "1 | the first thing ever",
            "2 | a very nice thing indeed"
        ]