import logging

from remotes.dispatch import handler
from remotes.tools import packing_body, judge_version
from remotes.models import VersionHash, Remote

logger = logging.getLogger(__name__)


@handler("remote.heartbeat")
def remotes_heartbeat(message, send):
    """
    Handle heartbeat sent from a SML to a SMC.
    """
    if message.remote is not None:
        remote = message.remote
        remote.last_seen = message.created_at
        remote.save()
    logger.debug(f"heartbeat received from {message.origin}")


@handler("remote.mgn.status")
def remote_mgn_status(message, send):
    """Handler version request from SML to SMC.
    This function do the packing of the body (that include all version hash) &
    define the response with the respective command.
    """

    response = message.make_response(command="remote.mgn.status.response", body=packing_body())
    send(response)


@handler("remote.mgn.status.response")
def remote_mgn_status_response(message, send):
    """Handler store response in SMC.
    This function receive the response command from the SML with a
    message that include the versioning hashing, the dir hash and
    the remote object.
    """

    remote = Remote.objects.filter(namespace=message.origin).first()

    version_hash = VersionHash(
        remote=remote,
        created_at=message.created_at,
        manifest_versions=message.body['manifest_versions'],
        hashes_set=message.body['hashes'],
    )
    version_hash.save()

    judge_version(VersionHash.objects.get(id=version_hash.id))
