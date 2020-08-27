import contextlib
from pathlib import Path
import secrets

import utils
import jobs.storage


@contextlib.contextmanager
def random_file():
    with utils.sandbox() as root:
        filename = f"random-{secrets.token_urlsafe(8)}"
        with open(root / filename, "w") as f:
            f.write(secrets.token_urlsafe(40))
        yield root / filename


def test_check_validates_testing_environment(s3_bucket):
    jobs.storage.check()


def test_backup_empty_bucket_works(sandbox, s3_bucket):
    # Perform a backup
    jobs.storage.backup(sandbox, "test-backup-id")
    # Expect the backup to be empty
    backup_folder = sandbox / "storage-test-backup-id"
    utils.command("tar", "-xzf", f"{backup_folder}.tgz", "-C", str(sandbox))
    structure = set(backup_folder.glob("**/*"))
    assert len(structure) == 0


def test_backup_clones_directory_structure(sandbox, settings, s3_bucket):
    # Fill the bucket with some files
    with random_file() as file1, \
         random_file() as file2, \
         random_file() as file3:
        jobs.storage._s3_command(
            "cp",
            str(file1),
            f"s3://{settings.S3_BUCKET_NAME}/file1",
        )
        jobs.storage._s3_command(
            "cp",
            str(file2),
            f"s3://{settings.S3_BUCKET_NAME}/some-dir/file2",
        )
        jobs.storage._s3_command(
            "cp",
            str(file3),
            f"s3://{settings.S3_BUCKET_NAME}/some-other-dir/some-nested-dir/file3",
        )

        # Perform a backup
        jobs.storage.backup(sandbox, "test-backup-id")

        # Expect the backup to contain the appropriate directory
        # structure and file contents
        backup_folder = sandbox / "storage-test-backup-id"
        utils.command("tar", "-xzf", f"{backup_folder}.tgz", "-C", str(sandbox))
        structure = sorted(map(
            lambda p: str(p.relative_to(backup_folder)),
            filter(lambda p: p.is_file(), backup_folder.glob("**/*")),
        ))
        assert structure == [
            "file1",
            "some-dir/file2",
            "some-other-dir/some-nested-dir/file3",
        ]
        with open(file1) as original_file1, \
             open(backup_folder / "file1") as fetched_file1:
            assert original_file1.read() == fetched_file1.read()
        with open(file2) as original_file2, \
             open(backup_folder / "some-dir/file2") as fetched_file2:
            assert original_file2.read() == fetched_file2.read()
        with open(file3) as original_file3, \
             open(backup_folder / "some-other-dir/some-nested-dir/file3") as fetched_file3:
            assert original_file3.read() == fetched_file3.read()


def build_empty_backup(target_dir):
    """Builds a valid but empty backup file and moves it to target_dir

    """
    backup_id = "test-backup-id"
    with utils.sandbox() as root:
        base = Path(root / f"storage-{backup_id}")
        base.mkdir()
        utils.command("tar", "-czf", f"{base}.tgz", "-C", str(root), f"storage-{backup_id}")
        utils.command("mv", f"{base}.tgz", Path(target_dir) / f"storage-{backup_id}.tgz")
    return Path(target_dir) / f"storage-{backup_id}.tgz", backup_id


def build_fake_backup(target_dir, content):
    """Builds a fake backup archive, consisting of the following three
    files:

    storage-test-backup-id
    ├─ file1
    ├─ some-dir
    │  └─ file2
    └─ some-other-dir
        └─ some-nested-dir
            └─ file3

    The contents of each of the files is "file{n}{content}" with '{n}'
    being 1, 2 or 3.

    """
    backup_id = "test-backup-id"
    with utils.sandbox() as root:
        base = Path(root / f"storage-{backup_id}")
        base.mkdir()
        with open(base / "file1", "w") as file1:
            file1.write(f"file1{content}")
        Path(base / "some-dir").mkdir()
        with open(base / "some-dir" / "file2", "w") as file2:
            file2.write(f"file2{content}")
        Path(base / "some-other-dir" / "some-nested-dir").mkdir(parents=True)
        with open(base / "some-other-dir" / "some-nested-dir" / "file3", "w") as file3:
            file3.write(f"file3{content}")
        utils.command("tar", "-czf", f"{base}.tgz", "-C", str(root), f"storage-{backup_id}")
        utils.command("mv", f"{base}.tgz", Path(target_dir) / f"storage-{backup_id}.tgz")
    return Path(target_dir) / f"storage-{backup_id}.tgz", backup_id


def get_s3_file_structure(settings):
    with utils.sandbox() as base:
        jobs.storage._s3_command(
            "ls", f"s3://{settings.S3_BUCKET_NAME}", "--recursive",
            output=base / "objects",
        )
        with open(base / "objects") as structure_output:
            return sorted(
                line.strip().split()[-1]
                for line in structure_output.readlines()
            )


def test_restore_empty_backup_works(sandbox, settings, s3_bucket):
    # Write a file to the S3 backend
    with random_file() as f:
        jobs.storage._s3_command("cp", str(f), f"s3://{settings.S3_BUCKET_NAME}/some-file")
    # Make an empty backup
    backup, backup_id = build_empty_backup(sandbox)
    # Perform a restore
    jobs.storage.restore(sandbox, backup_id)
    # Check the file structure in the S3 backend (expect no changes)
    assert get_s3_file_structure(settings) == ["some-file"]


def test_restore_clones_directory_structure(sandbox, settings, s3_bucket):
    # Make a fake backup
    backup, backup_id = build_fake_backup(sandbox, "test-restoration")
    # Perform a restore
    jobs.storage.restore(sandbox, backup_id)
    # Check the file structure in the s3 backend
    assert get_s3_file_structure(settings) == [
        "file1",
        "some-dir/file2",
        "some-other-dir/some-nested-dir/file3",
    ]
    # Check the file contents
    jobs.storage._s3_command(
        "cp",
        f"s3://{settings.S3_BUCKET_NAME}/file1",
        str(sandbox / "file1"),
    )
    with open(sandbox / "file1") as file1:
        assert file1.read() == "file1test-restoration"
    jobs.storage._s3_command(
        "cp",
        f"s3://{settings.S3_BUCKET_NAME}/some-dir/file2",
        str(sandbox / "file2"),
    )
    with open(sandbox / "file2") as file2:
        assert file2.read() == "file2test-restoration"
    jobs.storage._s3_command(
        "cp",
        f"s3://{settings.S3_BUCKET_NAME}/some-other-dir/some-nested-dir/file3",
        str(sandbox / "file3"),
    )
    with open(sandbox / "file3") as file3:
        assert file3.read() == "file3test-restoration"


def test_restore_merges_directory_structure(sandbox, settings, s3_bucket):
    # Write a not-to-be-overwritten file to the S3 backend
    with random_file() as f:
        jobs.storage._s3_command("cp", str(f), f"s3://{settings.S3_BUCKET_NAME}/old-file")
    # Write a file that WILL be overwritten by the restore
    with random_file() as f:
        jobs.storage._s3_command("cp", str(f), f"s3://{settings.S3_BUCKET_NAME}/some-dir/file2")
    # Make a fake backup
    backup, backup_id = build_fake_backup(sandbox, "test-merge-restoration")
    # Perform a restore
    jobs.storage.restore(sandbox, backup_id, purge=False)
    # Check the file structure in the s3 backend
    assert get_s3_file_structure(settings) == [
        "file1",
        "old-file",
        "some-dir/file2",
        "some-other-dir/some-nested-dir/file3",
    ]
    # Check the file contents
    jobs.storage._s3_command(
        "cp",
        f"s3://{settings.S3_BUCKET_NAME}/file1",
        str(sandbox / "file1"),
    )
    with open(sandbox / "file1") as file1:
        assert file1.read() == "file1test-merge-restoration"
    jobs.storage._s3_command(
        "cp",
        f"s3://{settings.S3_BUCKET_NAME}/some-dir/file2",
        str(sandbox / "file2"),
    )
    with open(sandbox / "file2") as file2:
        assert file2.read() == "file2test-merge-restoration"
    jobs.storage._s3_command(
        "cp",
        f"s3://{settings.S3_BUCKET_NAME}/some-other-dir/some-nested-dir/file3",
        str(sandbox / "file3"),
    )
    with open(sandbox / "file3") as file3:
        assert file3.read() == "file3test-merge-restoration"


def test_restore_purges_structure_difference(sandbox, settings, s3_bucket):
    # Write a to-be-purged file to the S3 backend
    with random_file() as f:
        jobs.storage._s3_command("cp", str(f), f"s3://{settings.S3_BUCKET_NAME}/old-file")
    # Make a fake backup
    backup, backup_id = build_fake_backup(sandbox, "test-merge-restoration")
    # Perform a restore
    jobs.storage.restore(sandbox, backup_id, purge=True)
    # Check the file structure in the s3 backend
    assert get_s3_file_structure(settings) == [
        "file1",
        "some-dir/file2",
        "some-other-dir/some-nested-dir/file3",
    ]
