import logging

from conf import settings
import utils

logger = logging.getLogger(__name__)


def _s3_command(*args, **kwargs):
    return utils.command(
        "aws",
        *(
            ()
            if settings.S3_ENDPOINT_URL is None
            else ("--endpoint-url", settings.S3_ENDPOINT_URL)
        ),
        "s3",
        *args,
        **{
            **kwargs,
            "env": {
                **kwargs.get("env", {}),
                "AWS_ACCESS_KEY_ID": settings.S3_ACCESS_KEY_ID,
                "AWS_SECRET_ACCESS_KEY": settings.S3_SECRET_ACCESS_KEY,
            },
        },
    )


def check():
    """Checks whether a simple command can be resolved against the S3
    backend.

    """
    assert settings.S3_ACCESS_KEY_ID is not None, \
        "S3_ACCESS_KEY_ID is not defined"
    assert settings.S3_SECRET_ACCESS_KEY is not None, \
        "S3_SECRET_ACCESS_KEY is not defined"
    assert settings.S3_BUCKET_NAME is not None, \
        "S3_BUCKET_NAME is not defined"
    _s3_command("ls", f"s3://{settings.S3_BUCKET_NAME}")


def backup(base, id):
    """Performs a backup of the contents of the S3 bucket through awscli's
    s3 sync utility.

    """
    logger.info("Synching bucket to local folder")
    bucket = base / f"storage-{id}"
    bucket.mkdir()
    _s3_command("sync", f"s3://{settings.S3_BUCKET_NAME}", str(bucket))
    logger.info("Building tar archive")
    utils.command("tar", "-czf", f"{bucket}.tgz", "-C", str(base), str(bucket.name))
    utils.command("rm", "-rf", str(bucket))


def restore(base, id, purge=False):
    """Performs a restore operation through awscli's s3 sync utility. If
    *purge* is false (the default), this won't delete files that are
    present on the target bucket but absent on the backup.

    """
    logger.info("Extracting archive")
    bucket = base / f"storage-{id}"
    utils.command("tar", "-xzf", f"{bucket}.tgz", "-C", str(base))
    logger.info("Synching local folder to bucket")
    _s3_command(*(
        "sync",
        *(("--delete",) if purge else ()),
        str(bucket),
        f"s3://{settings.S3_BUCKET_NAME}"
    ))
