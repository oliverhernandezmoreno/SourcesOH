#!/usr/bin/env python
import logging

import click

import schedule
import settings


@click.group()
def manage():
    """Management actions for this flask application.

    """
    pass


@manage.command()
def info():
    """Prints all configuration variables.

    """
    for k, v in settings.freeze().items():
        click.echo(f"{k}={v}")


@manage.command()
def startpoller():
    """Starts the http poller.

    """
    logging_levels = {
        "CRITICAL": logging.CRITICAL,
        "ERROR": logging.ERROR,
        "WARNING": logging.WARNING,
        "INFO": logging.INFO,
        "DEBUG": logging.DEBUG,
        "NOTSET": logging.NOTSET,
    }
    logging.basicConfig(
        level=logging_levels.get(settings.LOG_LEVEL.upper(), logging.INFO),
        format="[%(levelname)s] [%(name)s] %(message)s",
    )
    schedule.start()


if __name__ == "__main__":
    manage()
