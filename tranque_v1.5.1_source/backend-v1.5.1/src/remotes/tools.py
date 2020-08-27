import logging

from checksumdir import dirhash
from os import path, listdir

from targets.profiling import MANIFESTS
from django.conf import settings

logger = logging.getLogger(__name__)


def get_dirhash(dir):
    return dirhash(dir, 'sha512') if (path.exists(dir) and len(listdir(dir)) != 0) else None


def packing_body():
    """ Packing function for a message's body.
    This function do the packaging of the body, for
    response versioning message, with the all necessary hash.
    """
    _manif_versions = list(map(lambda m: m.get('version'), MANIFESTS.values()))

    _list_h = [
        ['profiles_base_dir_hash', get_dirhash(settings.PROFILES_BASE)],
        ['alert_base_dir', get_dirhash(settings.ALERT_MODULES_ROOT)],
        ['base_dir', get_dirhash(settings.BASE_DIR)]
    ]

    return {
        'manifest_versions': _manif_versions,
        'hashes': _list_h,
        'commit': settings.COMMIT,
    }


def judge_version(version_hash_obj):

    _hashes_set = version_hash_obj.hashes_set
    _clue_hashes_set = packing_body()['hashes']
    _set_h = list(map(lambda x, y: [x[0], x[1] == y[1] if x[1] is not None or y[1] is not None else None],
                      _hashes_set, _clue_hashes_set))

    version_hash_obj.is_valid_set = _set_h
    version_hash_obj.save()
