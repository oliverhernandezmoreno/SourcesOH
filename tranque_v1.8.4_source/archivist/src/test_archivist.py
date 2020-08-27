from click.testing import CliRunner

from archivist import JOBS, main


def test_info_works_properly(full_setup):
    runner = CliRunner()
    result = runner.invoke(main, ["info"])
    assert result.exit_code == 0


def test_check_validates_testing_environment(full_setup):
    runner = CliRunner()
    result = runner.invoke(main, ["check"])
    assert result.exit_code == 0
    assert result.output == "Everything is ready\n"


def test_simple_backup_restore_works_properly(sandbox, full_setup):
    runner = CliRunner()
    result = runner.invoke(main, ["simple-backup", str(sandbox), "jobs.storage", "jobs.elasticsearch"])
    assert result.exit_code == 0
    backup = list(sandbox.glob("**/*"))[0]
    result = runner.invoke(main, ["simple-restore", "-y", str(backup)])
    assert result.exit_code == 0


def test_incorrect_job_name_gets_caught(full_setup):
    runner = CliRunner()
    result = runner.invoke(main, ["check", "jobs.nonexistent", "jobs.storage"])
    assert result.exit_code == 1


def test_backup_list_restore_works_properly(full_setup):
    runner = CliRunner()
    # List for 'no backups'
    result = runner.invoke(main, ["list"])
    assert result.exit_code == 0
    # Restore latest without backups
    result = runner.invoke(main, ["restore", "-y", "latest"])
    assert result.exit_code != 0
    # Backup
    result = runner.invoke(main, ["backup"])
    assert result.exit_code == 0
    # List for one backup
    result = runner.invoke(main, ["list"])
    assert result.exit_code == 0
    # Restore
    backup = result.output.split("\n")[1].split()[0]
    result = runner.invoke(main, ["restore", "-y", backup])
    assert result.exit_code == 0
    # Restore with one job less
    result = runner.invoke(main, ["restore", "-y", backup, *(job.__name__ for job in JOBS[:-1])])
    assert result.exit_code == 0
    # Restore latest with backups
    result = runner.invoke(main, ["restore", "-y", "latest"])
    assert result.exit_code == 0
