import collections
import datetime
import json
import logging
from pathlib import Path
import re
import secrets

from conf import settings
import utils

logger = logging.getLogger(__name__)


def make_bundle(base):
    """Makes a bundle directory to hold all backup artifacts. Returns the
    directory's name and the bundle ID.

    """
    today = datetime.date.today().isoformat()
    bundle_id = secrets.token_urlsafe(8)
    bundle = base / f"bundle-{today}-{bundle_id}"
    bundle.mkdir(mode=0o755, parents=True, exist_ok=True)
    logger.debug(f"Made bundle {bundle}")
    return bundle, bundle_id


def _aws_command(*args, **kwargs):
    return utils.command(
        "aws",
        *(
            ()
            if settings.BACKUP_ENDPOINT_URL is None
            else ("--endpoint-url", settings.BACKUP_ENDPOINT_URL)
        ),
        *args,
        **{
            **kwargs,
            "env": {
                **kwargs.get("env", {}),
                "AWS_ACCESS_KEY_ID": settings.BACKUP_ACCESS_KEY_ID,
                "AWS_SECRET_ACCESS_KEY": settings.BACKUP_SECRET_ACCESS_KEY,
            },
        },
    )


def _s3_command(*args, **kwargs):
    return _aws_command("s3", *args, **kwargs)


def check():
    """Checks whether a connection with the object repository can be
    established.

    """
    assert settings.BACKUP_ACCESS_KEY_ID is not None, \
        "BACKUP_ACCESS_KEY_ID is not defined"
    assert settings.BACKUP_SECRET_ACCESS_KEY is not None, \
        "BACKUP_SECRET_ACCESS_KEY is not defined"
    assert settings.BACKUP_BUCKET_NAME is not None, \
        "BACKUP_BUCKET_NAME is not defined"
    _s3_command("ls", f"s3://{settings.BACKUP_BUCKET_NAME}")


def simple_save(bundle, target=None):
    "Compresses a bundle, and optionally moves it to *target*."
    logger.info(f"Building a compressed archive of {bundle}")
    utils.command(
        "tar",
        "-czf", f"{bundle}.tgz",
        "-C", str(Path(bundle).parent),
        str(Path(bundle).name),
    )
    if target is not None:
        utils.command("cp", f"{bundle}.tgz", f"{target}")


def save(bundle):
    "Saves a bundle to the object repository."
    simple_save(bundle)
    logger.info(
        f"Uploading compressed archive {bundle.name}.tgz to object repository",
    )
    _s3_command(
        "cp",
        f"{bundle}.tgz",
        f"s3://{settings.BACKUP_BUCKET_NAME}/{settings.NAMESPACE}/{bundle.name}.tgz",
    )
    backups = get_backups(bundle.parent)
    if len(backups) > settings.BACKUPS_KEPT:
        logger.info(f"Removing {len(backups) - settings.BACKUPS_KEPT} old backups")
        for old_backup in backups[settings.BACKUPS_KEPT:]:
            _s3_command("rm", f"s3://{settings.BACKUP_BUCKET_NAME}/{settings.NAMESPACE}/{old_backup['KEY']}")


# Source: https://stackoverflow.com/a/1094933
def _format_size(num, suffix='B'):
    for unit in ['', 'Ki', 'Mi', 'Gi', 'Ti', 'Pi', 'Ei', 'Zi']:
        if abs(num) < 1024.0:
            return "%3.1f%s%s" % (num, unit, suffix)
        num /= 1024.0
    return "%.1f%s%s" % (num, 'Yi', suffix)


def _match_backup_key(key):
    return re.match(r"^bundle-\d{4}-\d{2}-\d{2}-(.*)\.tgz$", key)


def get_backups(base):
    """Returns a list of backup objects present in the object repository.

    """
    _aws_command(
        "s3api",
        "list-objects",
        "--bucket",
        settings.BACKUP_BUCKET_NAME,
        "--prefix",
        settings.NAMESPACE,
        output=base / "backups.json",
        env={"AWS_DEFAULT_OUTPUT": "json"},
    )
    with open(base / "backups.json") as f:
        data = f.read()
        if not data:
            return []
        return sorted([
            collections.OrderedDict([
                ("KEY", entry["Key"][len(settings.NAMESPACE) + 1:]),
                ("SIZE", _format_size(entry["Size"])),
                ("LAST_MODIFIED", entry["LastModified"]),
            ])
            for entry in json.loads(data)["Contents"]
            if _match_backup_key(entry["Key"][len(settings.NAMESPACE) + 1:])
        ], key=lambda entry: entry["LAST_MODIFIED"], reverse=True)


def simple_load(base, archive):
    "Untars a bundle onto the base directory"
    archive_name = Path(archive).name
    matched = _match_backup_key(archive_name)
    assert matched is not None, "backup key is invalid"
    bundle_id = matched.groups()[0]
    logger.info(f"Extracting archive {archive}")
    utils.command("tar", "-xzf", f"{archive}", "-C", str(base))
    bundle = base / archive_name[:-4]
    assert bundle.is_dir(), "Extracted bundle is not a directory"
    return bundle, bundle_id


def load(base, archive):
    "Downloads and untars a bundle from the object repository."
    if archive == "latest":
        archives = get_backups(base)
        if not archives:
            raise ValueError("no backups available: 'latest' can't be resolved")
        archive = archives[0]["KEY"]
        logger.info(f"Resolved 'latest' to {archive}")
    logger.info(f"Downloading archive {archive} from object repository")
    _s3_command(
        "cp",
        f"s3://{settings.BACKUP_BUCKET_NAME}/{settings.NAMESPACE}/{archive}",
        f"{base / archive}",
    )
    return simple_load(base, base / archive)
