#!/usr/bin/env python
import logging

import click

from app import create_app
import settings


def create_debug_app():
    """Returns a new app with debug settings.

    """
    logging.basicConfig(
        format="[{levelname}] [{name}] {message}",
        style="{",
        level=logging.DEBUG,
    )
    return create_app("development", {
        **settings.freeze(),
        "DEBUG": True,
        "ENV": "development",
    })


@click.group()
def manage():
    """Management actions for this flask application.

    """
    pass


@manage.command()
def show_rules():
    """Prints all URL rules defined for the app.

    """
    for rule in sorted(create_debug_app().url_map.iter_rules(), key=lambda rule: str(rule)):
        print(repr(rule))


@manage.command()
def run():
    """Runs the application in a development server.

    """
    create_debug_app().run(load_dotenv=False)


if __name__ == "__main__":
    manage()
