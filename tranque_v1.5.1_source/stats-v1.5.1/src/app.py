import importlib
import logging

from flask import Blueprint
from flask import current_app
from flask import Flask
from flask import jsonify
from jsonschema import ValidationError
from raven.contrib.flask import Sentry
from werkzeug.exceptions import HTTPException

import validation

logger = logging.getLogger(__name__)


def init_sentry(app, dsn):
    """Initializes the sentry instance.

    """
    if dsn is not None:
        app.sentry = Sentry(app, dsn=dsn)


def collect_blueprints(modules):
    """Collects all blueprints named in *modules* into a dictionary of
    module names mapped to blueprints.

    """
    return {
        module: blueprint
        for module, blueprint in (
            (module, getattr(importlib.import_module(f"blueprints.{module}.endpoints"), "bp", None))
            for module in (modules or ())
        )
        if blueprint is not None
        if isinstance(blueprint, Blueprint)
    }


def jsonschema_validation_error(e):
    """An error handler for validation errors produced by jsonschema
    (presumably at request body validation time).

    """
    if current_app.config["DEBUG"]:
        logging.exception(e)
    return jsonify(
        code=400,
        error="Schema Validation Error",
        description=e.message,
        extra={
            "path": list(e.path),
        },
    ), 400


def werkzeug_http_exception(e):
    """A common werkzeug http error handler.

    """
    if current_app.config["DEBUG"]:
        logging.exception(e)
    code = getattr(e, "code", 500)
    return jsonify(
        code=code,
        error=getattr(e, "name", "Unknown Error"),
        description=getattr(e, "description", None),
        extra={},
    ), code


def validation_error(e):
    """An error handler for custom validation errors.

    """
    if current_app.config["DEBUG"]:
        logging.exception(e)
    return jsonify(
        code=400,
        error="Validation Error",
        description=e.message,
        extra={},
    ), 400


def any_other_error(e):
    """A catch-all exception handler.

    """
    logger.exception(e)
    return jsonify(
        code=500,
        error="Unknown Error",
        description=None,
        extra={},
    ), 500


def create_app(name, settings):
    """Creates an application named *name* with the settings specified in
    the *settings* dictionary.

    """
    app = Flask(name, static_folder=None)
    app.config.update(settings)
    for module, bp in collect_blueprints(settings.get("BLUEPRINTS")).items():
        logger.info(f"Registered blueprint {module}")
        app.register_blueprint(bp, url_prefix=bp.url_prefix or f"/{module}")
    init_sentry(app, settings.get("SENTRY_DSN"))
    app.register_error_handler(
        ValidationError,
        jsonschema_validation_error,
    )
    app.register_error_handler(
        HTTPException,
        werkzeug_http_exception,
    )
    app.register_error_handler(
        validation.ValidationError,
        validation_error,
    )
    app.register_error_handler(
        Exception,
        any_other_error,
    )
    return app
