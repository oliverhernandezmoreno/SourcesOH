import io
import logging
import secrets

import boto3
from django.conf import settings

from remotes.dispatch import handler

logger = logging.getLogger(__name__)


SMC_CONNECTION_TEST_COMMAND = "remotes.test-smc-connection"
SML_CONNECTION_TEST_COMMAND = "remotes.test-sml-connection"


@handler("ping")
def ping(message, send):
    """Respond to a ping command with a test.pong command.

    """
    logger.debug("Ping received, sending pong back")
    response = message.make_response(command="pong")
    send(response)


@handler("pong")
def pong(message, send):
    """Handler of a pong command

    """
    logger.debug("Pong received")


def random_file():
    "Generates a random small readable file and a random path."
    return (
        io.BytesIO(secrets.token_bytes(32)),
        f"tmp/test/test-{secrets.token_urlsafe(8)}"
    )


@handler(SMC_CONNECTION_TEST_COMMAND)
def handle_sml_test(message, send):
    """To be executed by the SMC.

    Respond to a test command, which includes a reference to a file
    which should exist in the remote's bucket.

    """
    remote = message.remote
    if remote is None:
        logger.warn(f"Received test command but the remote is not present -- namespace: {message.origin}")
        return
    s3_smc = boto3.client(
        "s3",
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        endpoint_url=settings.AWS_S3_ENDPOINT_URL
    )
    try:
        s3_smc.get_object(Bucket=remote.bucket, Key=message.body.get("file"))
    except Exception:
        logger.warn(f"Received test command but the attached file wasn't found -- file: {message.body.get('file')}")
        return
    send(message.make_response(command=f"{SMC_CONNECTION_TEST_COMMAND}.response"))


@handler(f"{SMC_CONNECTION_TEST_COMMAND}.response")
def handle_sml_test_response(message, send):
    "To be executed by the SML."
    s3_smc = boto3.client(
        "s3",
        aws_access_key_id=settings.SMC_S3_ACCESS_KEY_ID,
        aws_secret_access_key=settings.SMC_S3_SECRET_ACCESS_KEY,
        endpoint_url=settings.SMC_S3_ENDPOINT_URL
    )
    try:
        s3_smc.delete_object(Bucket=settings.SMC_S3_BUCKET_NAME, Key=message.body.get("file"))
    except Exception:
        logger.warn(f"Couldn't delete test file: {message.body.get('file')}")


@handler(SML_CONNECTION_TEST_COMMAND)
def handle_smc_test(message, send):
    "To be executed by the SML."
    s3_smc = boto3.client(
        "s3",
        aws_access_key_id=settings.SMC_S3_ACCESS_KEY_ID,
        aws_secret_access_key=settings.SMC_S3_SECRET_ACCESS_KEY,
        endpoint_url=settings.SMC_S3_ENDPOINT_URL
    )
    try:
        s3_smc.get_object(Bucket=settings.SMC_S3_BUCKET_NAME, Key=message.body.get("file"))
    except Exception:
        logger.warn(f"Received test command but the attached file wasn't found -- file: {message.body.get('file')}")
        return
    send(message.make_response(command=f"{SML_CONNECTION_TEST_COMMAND}.response"))


@handler(f"{SML_CONNECTION_TEST_COMMAND}.response")
def handle_smc_test_response(message, send):
    "To be executed by the SMC."
    remote = message.remote
    if remote is None:
        logger.warn(f"Received test response but the remote is not present -- namespace: {message.origin}")
        return
    s3_smc = boto3.client(
        "s3",
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        endpoint_url=settings.AWS_S3_ENDPOINT_URL
    )
    try:
        s3_smc.delete_object(Bucket=remote.bucket, Key=message.body.get("file"))
    except Exception:
        logger.warn(f"Couldn' delete test file: {message.body.get('file')}")
