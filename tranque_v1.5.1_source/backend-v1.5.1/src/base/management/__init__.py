import os
import subprocess

from django.conf import settings

# This parent's process list of daemons. This is a list of
# waiting-to-be-polled processes. Once finished, they're removed from
# the list.
daemons = []


def daemon_call_command(*args):
    """Calls a management command in a subprocess, and doesn't wait for
    it.

    """
    if settings.DAEMON:
        raise RuntimeError("can't call nested daemons")
    # poll daemons to cleanup
    for daemon in list(daemons):
        status = daemon.poll()
        if status is not None:
            daemons.remove(daemon)
    # spawn new daemon and store it in the list
    p = subprocess.Popen(
        ["python", os.path.join(settings.BASE_DIR, "manage.py"), *args],
        stdin=subprocess.DEVNULL,
        env=dict(os.environ, DAEMON="1"),
    )
    daemons.append(p)
    return p
