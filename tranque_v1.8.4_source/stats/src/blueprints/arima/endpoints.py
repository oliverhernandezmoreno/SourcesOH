"""HTTP wrapper for pmdarima:

https://www.alkaline-ml.com/pmdarima/index.html

Documentation for the various parameters should be read from there.

"""
import logging

from flask import Blueprint
from flask import jsonify
import numpy as np
from pmdarima import arima

from .schemas import arima_model
from .schemas import arima_schema
from .schemas import autofit_model
from .schemas import autofit_predict_model
from .schemas import predict_model
from validation import with_schema
from validation import ValidationError

logger = logging.getLogger(__name__)

bp = Blueprint("arima", __name__)


def serialize_model(arima_model):
    """Returns a serializable version of the given arima model.

    """
    return {
        k: v
        for k, v in (
            (k, getattr(arima_model, k, None))
            for k in arima_schema["properties"]
        )
        if v is not None
    }


@bp.route("/auto/fit/schema/", methods=("GET",))
def auto_fit_schema():
    """Returns the JSON schema for the fit endpoint.

    """
    return jsonify(autofit_model.schema)


@bp.route("/auto/fit/", methods=("POST",))
@with_schema(autofit_model)
def auto_fit(body):
    """Performs the auto fit for the best ARIMA model, and returns the
    serialized model.

    """
    logger.info(
        "received /auto/fit/ request with "
        f"{len(body['fit'])} fit elements"
    )
    fit = np.array(body["fit"], dtype=np.float32)
    exogenous = (
        np.array(body["exogenous"], dtype=np.float32)
        if body.get("exogenous")
        else None
    )
    model = arima.auto_arima(
        fit,
        exogenous=exogenous,
        **{
            **body["params"],
            "suppress_warnings": True,
            "error_action": "ignore",
        },
    )
    if model is None:
        raise RuntimeError("couldn't find an ARIMA fit")
    return jsonify(model=serialize_model(model))


@bp.route("/auto/fit-predict/schema/", methods=("GET",))
def auto_fit_predict_schema():
    """Returns the JSON schema for the fit-predict endpoint.

    """
    return jsonify(autofit_predict_model.schema)


@bp.route("/auto/fit-predict/", methods=("POST",))
@with_schema(autofit_predict_model)
def auto_fit_predict(body):
    """Performs the auto fit for the best ARIMA model, performs a forecast
    afterwards, and returns the serialized model alongside the
    predicted results.

    """
    logger.info(
        "received /auto/fit-predict/ request with "
        f"{len(body['autofit']['fit'])} fit elements and "
        f"{body['predict']['n']} predictions"
    )
    fit = np.array(body["autofit"]["fit"], dtype=np.float32)
    exogenous = (
        np.array(body["autofit"]["exogenous"], dtype=np.float32)
        if body["autofit"].get("exogenous")
        else None
    )
    model = arima.auto_arima(
        fit,
        exogenous=exogenous,
        **{
            **body["autofit"]["params"],
            "suppress_warnings": True,
            "error_action": "ignore",
        },
    )
    if model is None:
        raise RuntimeError("couldn't find an ARIMA fit")
    n = body["predict"]["n"]
    alpha = body["predict"]["alpha"]
    predictions, confidence_intervals = model.predict(
        n_periods=n,
        exogenous=exogenous,
        return_conf_int=True,
        alpha=alpha,
    )
    return jsonify(
        model=serialize_model(model),
        predictions=[
            {"value": value, "lower": lower, "upper": upper}
            for value, (lower, upper) in zip(
                predictions.tolist(),
                confidence_intervals.tolist(),
            )
        ],
    )


@bp.route("/check-model/schema/", methods=("GET",))
def check_model_schema():
    """Returns the JSON schema for check-model endpoint.

    """
    return jsonify(arima_model.schema)


@bp.route("/check-model/", methods=("POST",))
@with_schema(arima_model)
def check_model(body):
    """Checks the validity of a serialized ARIMA model.

    """
    try:
        arima.ARIMA(**{
            **body,
            "suppress_warnings": True,
        })
    except Exception as e:
        raise ValidationError(f"model is invalid: {e}")
    return jsonify(body)


@bp.route("/predict/schema/", methods=("GET",))
def predict_schema():
    """Returns the JSON schema for predict endpoint.

    """
    return jsonify(predict_model.schema)


@bp.route("/predict/", methods=("POST",))
@with_schema(predict_model)
def predict(body):
    """Performs a forecast given a serialized ARIMA model and a fit
    vector, returning the predicted results.

    """
    logger.info(
        "received /predict/ request with "
        f"{len(body['fit'])} fit elements and "
        f"{body['predict']['n']} predictions"
    )
    model = arima.ARIMA(**{
        **body["arima"],
        "suppress_warnings": True,
    })
    fit = np.array(body["fit"], dtype=np.float32)
    exogenous = (
        np.array(body["exogenous"], dtype=np.float32)
        if body.get("exogenous")
        else None
    )
    model.fit(fit, exogenous=exogenous)
    n = body["predict"]["n"]
    alpha = body["predict"]["alpha"]
    predictions, confidence_intervals = model.predict(
        n_periods=n,
        exogenous=exogenous,
        return_conf_int=True,
        alpha=alpha,
    )
    return jsonify(predictions=[
        {"value": value, "lower": lower, "upper": upper}
        for value, (lower, upper) in zip(
            predictions.tolist(),
            confidence_intervals.tolist(),
        )
    ])
