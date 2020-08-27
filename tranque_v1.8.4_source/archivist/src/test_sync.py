import sync
import utils


def test_check_validates_testing_environment(backup_bucket):
    sync.check()


def test_make_bundle_is_consistent_with_bundle_regex(sandbox):
    bundle, _ = sync.make_bundle(sandbox)
    assert sync._match_backup_key(f"{bundle.name}.tgz") is not None


def test_save_and_load_work_properly(sandbox, settings, backup_bucket):
    bundle, bundle_id = sync.make_bundle(sandbox)
    with open(bundle / "test-file", "w") as test_file:
        test_file.write("test-content")
    # Save the bundle
    sync.save(bundle)
    # Expect the bundle to be uploaded to the backup bucket
    utils.command("rm", "-rf", str(bundle), f"{bundle}.tgz")
    loaded_bundle, loaded_bundle_id = sync.load(sandbox, f"{bundle.name}.tgz")
    assert bundle_id == loaded_bundle_id
    with open(loaded_bundle / "test-file") as test_file:
        assert test_file.read() == "test-content"


def test_save_rotates_backups_properly(sandbox, settings, backup_bucket):
    original_bundles = []
    for backup_index in range(settings.BACKUPS_KEPT):
        bundle, _ = sync.make_bundle(sandbox)
        original_bundles.append(bundle.name)
        with open(bundle / "test-file", "w") as test_file:
            test_file.write(f"test-content-{backup_index}")
        # Save the bundle
        sync.save(bundle)
        # Remove trash
        utils.command("rm", "-rf", str(bundle), f"{bundle}.tgz")
    # Save once again
    bundle, _ = sync.make_bundle(sandbox)
    with open(bundle / "test-file", "w") as test_file:
        test_file.write("test-content-final")
    sync.save(bundle)
    # Expect the first bundle id to not be present
    backups = sync.get_backups(sandbox)
    assert [backup["KEY"] for backup in backups] == [
        f"{bundle.name}.tgz",
        *[f"{name}.tgz" for name in reversed(original_bundles[1:])]
    ]
