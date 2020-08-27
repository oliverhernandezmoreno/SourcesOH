from flask import Blueprint
from flask import current_app
from flask import jsonify

bp = Blueprint("health", __name__)


@bp.route("/", methods=("GET",))
def health():
    """Return a constant 'healthy' status.

    """
    return jsonify(status="healthy")


@bp.route("/config/", methods=("GET",))
def config():
    """Return a summary of non-sensitive configuration keys.

    """
    return jsonify({
        k: (
            repr(v)
            if not k.startswith("SECRET")
            and not k.endswith("_DSN")
            else "<hidden>"
        )
        for k, v in current_app.config.items()
    })
