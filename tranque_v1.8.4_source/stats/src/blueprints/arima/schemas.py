from validation import build_schema

# Schema for the ARIMA portion of a request, in terms of pmdarima's
# parameters
arima_schema = {
    "type": "object",
    "properties": {
        "order": {
            "type": "array",
            "items": {
                "type": "integer",
                "minimum": 0,
            },
            "minItems": 3,
            "maxItems": 3,
        },
        "seasonal_order": {
            "type": "array",
            "items": {
                "type": "integer",
            },
            "minItems": 4,
            "maxItems": 4,
        },
        "start_params": {
            "type": "array",
        },
        "transparams": {
            "type": "boolean",
        },
        "method": {
            "type": "string",
            "enum": ["lbfgs", "css-mle", "mle", "css"],
        },
        "solver": {
            "type": "string",
            "enum": ["lbfgs", "bfgs", "newton", "nm", "cg", "ncg", "powell"],
        },
        "maxiter": {
            "type": "integer",
            "exclusiveMinimum": 0,
        },
        "out_of_sample_size": {
            "type": "integer",
            "minimum": 0,
        },
        "scoring": {
            "type": "string",
            "enum": ["mse", "mae"],
        },
        "scoring_args": {
            "type": "object",
        },
        "trend": {
            "type": "string",
        },
        "with_intercept": {
            "type": "boolean",
        }
    },
    "additionalProperties": False,
    "required": ["order"],
}

# The validator for ARIMA's serialized models
arima_model = build_schema(arima_schema)

# Schema for the exogenous variables portion of a request
exogenous_schema = {
    "type": "array",
    "items": {
        "type": "array",
        "items": {
            "type": "number",
        },
    },
}

# Schema for the fit portion of a request
fit_schema = {
    "type": "array",
    "items": {
        "type": "number",
    },
    "minItems": 1,
}

# Schema for a positive integer
positive_integer_schema = {
    "type": "integer",
    "minimum": 1,
}

# Schema for the autofit portion of a request
autofit_schema = {
    "type": "object",
    "properties": {
        "params": {
            "type": "object",
            "properties": {
                "start_p": positive_integer_schema,
                "d": positive_integer_schema,
                "start_q": positive_integer_schema,
                "max_p": positive_integer_schema,
                "max_d": positive_integer_schema,
                "max_q": positive_integer_schema,
                "start_P": positive_integer_schema,
                "D": positive_integer_schema,
                "start_Q": positive_integer_schema,
                "max_P": positive_integer_schema,
                "max_D": positive_integer_schema,
                "max_Q": positive_integer_schema,
                "max_order": positive_integer_schema,
                "m": positive_integer_schema,
                "seasonal": {
                    "type": "boolean",
                },
                "stationary": {
                    "type": "boolean",
                },
                "information_criterion": {
                    "type": "string",
                    "enum": ["aic", "bic", "hqic", "oob"],
                },
                "alpha":  {
                    "type": "number",
                    "exclusiveMinimum": 0,
                    "exclusiveMaximum": 1,
                },
                "test": {
                    "type": "string",
                },
                "seasonal_test": {
                    "type": "string",
                },
                "start_params": {
                    "type": "array",
                },
                "transparams": {
                    "type": "boolean",
                },
                "method": {
                    "type": "string",
                    "enum": ["lbfgs", "css-mle", "mle", "css"],
                },
                "trend": {
                    "type": "string",
                },
                "solver": {
                    "type": "string",
                    "enum": ["lbfgs", "bfgs", "newton", "nm", "cg", "ncg", "powell"],
                },
                "maxiter": {
                    "type": "integer",
                    "exclusiveMinimum": 0,
                },
                "out_of_sample_size": {
                    "type": "integer",
                    "minimum": 0,
                },
                "scoring": {
                    "type": "string",
                    "enum": ["mse", "mae"],
                },
                "scoring_args": {
                    "type": "object",
                },
                "with_intercept": {
                    "type": "boolean",
                },
            },
            "additionalProperties": False,
            "required": [],
        },
        "exogenous": exogenous_schema,
        "fit": fit_schema,
    },
    "additionalProperties": False,
    "required": ["params", "fit"],
}

# Schema for the prediction portion of a request
predict_schema = {
    "type": "object",
    "properties": {
        "n": {
            "type": "integer",
            "minimum": 1,
        },
        "alpha": {
            "type": "number",
            "exclusiveMinimum": 0,
            "exclusiveMaximum": 1,
        },
    },
    "additionalProperties": False,
    "required": ["n", "alpha"],
}

# The validator for autofit requests
autofit_model = build_schema(autofit_schema)

# The validator for autofit_predict requests
autofit_predict_model = build_schema({
    "type": "object",
    "properties": {
        "autofit": autofit_schema,
        "predict": predict_schema,
    },
    "additionalProperties": False,
    "required": ["autofit", "predict"],
})

# The validator for predict requests, built from an arima model, a fit
# data set, and a predict request proper
predict_model = build_schema({
    "type": "object",
    "properties": {
        "arima": arima_schema,
        "fit": fit_schema,
        "exogenous": exogenous_schema,
        "predict": predict_schema,
    },
    "additionalProperties": False,
    "required": ["arima", "fit", "predict"],
})
