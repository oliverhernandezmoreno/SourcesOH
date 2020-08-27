import contextlib
import logging
import pathlib
import shutil
import subprocess
import tempfile

from conf import settings

logger = logging.getLogger(__name__)


@contextlib.contextmanager
def null_context(x):
    yield x


def command(*args, **options):
    """Runs the command given in *args* with input from the given file
    path, and output to the given file path. *env* must be a
    dictionary of environment variables for the command to use.

    Raises an exception if the command has a non-zero exit status.

    """
    input, output, env = map(options.get, ("input", "output", "env"))
    env = {
        **(env or {}),
        "PATH": settings.PATH,
        "LANG": settings.LANG,
    }
    input_file = (
        open(input, "rb")
        if input is not None
        else null_context(subprocess.DEVNULL)
    )
    output_file = (
        open(output, "wb")
        if output is not None
        else null_context(subprocess.DEVNULL)
    )
    with input_file as in_file:
        with output_file as out_file:
            logger.debug("".join((
                f"Running: {' '.join(map(str, args))}",
                f" < {input}" if input else "",
                f" > {output}" if output else "",
            )))
            p = subprocess.Popen(
                args,
                stdin=in_file,
                stdout=out_file,
                stderr=None,
                env=env,
            )
            p.wait()
            if p.returncode != 0:
                raise RuntimeError(
                    f"command {' '.join(map(str, args))} failed with status {p.returncode}",
                )


@contextlib.contextmanager
def sandbox():
    "Provide a temporary directory for file-based commands"
    base = tempfile.mkdtemp()
    try:
        logger.debug(f"Built sandbox: {base}")
        yield pathlib.Path(base)
    finally:
        logger.debug(f"Destroying sandbox: {base}")
        shutil.rmtree(base, ignore_errors=True)
