import pmdarima as pm


def test_schema_endpoints(client):
    """The jsonschema is made available in /schema/ endpoints.

    """
    assert 200 <= client.get("/arima/auto/fit/schema/").status_code < 300
    assert 200 <= client.get("/arima/auto/fit-predict/schema/").status_code < 300
    assert 200 <= client.get("/arima/check-model/schema/").status_code < 300
    assert 200 <= client.get("/arima/predict/schema/").status_code < 300


def test_check_model_invalid(client):
    """The model checker can identify schema problems.

    """
    invalid_model_one = {
        "order": (1, 2, 3, 4),
    }
    response = client.post("/arima/check-model/", json=invalid_model_one)
    assert response.json["code"] == response.status_code == 400
    assert response.json["error"] == "Schema Validation Error"
    assert response.json["extra"].get("path") == ["order"]

    invalid_model_two = {
        "order": (1, 2, 3),
        "method": "non-existent",
    }
    response = client.post("/arima/check-model/", json=invalid_model_two)
    assert response.json["code"] == response.status_code == 400
    assert response.json["error"] == "Schema Validation Error"
    assert response.json["extra"].get("path") == ["method"]

    invalid_model_three = {
        "maxiter": 1,
        "transparams": True,
    }
    response = client.post("/arima/check-model/", json=invalid_model_three)
    assert response.json["code"] == response.status_code == 400
    assert response.json["error"] == "Schema Validation Error"
    assert response.json["extra"].get("path") == []

    valid_model = {
        "order": [1, 2, 3]
    }
    response = client.post("/arima/check-model/", json=valid_model)
    assert 200 <= response.status_code < 300
    assert response.json == valid_model


def test_autofit(client):
    """The autofit endpoint can generate ARIMA models.

    """
    data = pm.datasets.load_woolyrnq().tolist()
    response = client.post("/arima/auto/fit/", json={
        "params": {
            "m": 4,
            "maxiter": 2,  # set to prevent long-running tests
        },
        "fit": data,
    })
    assert 200 <= response.status_code < 300
    model = response.json["model"]
    assert 200 <= client.post("/arima/check-model/", json=model).status_code < 300


def test_autofit_predict(client):
    """The fit-predict endpoint can generate ARIMA models, and make
    predictions. The predictions should be consistent with those
    obtained from the non-auto predict endpoint.

    """
    data = pm.datasets.load_woolyrnq().tolist()
    predict = {"n": 4, "alpha": 0.05}
    response = client.post("/arima/auto/fit-predict/", json={
        "autofit": {
            "params": {
                "m": 4,
                "maxiter": 2,
            },
            "fit": data,
        },
        "predict": predict,
    })
    assert 200 <= response.status_code < 300
    model = response.json["model"]
    assert 200 <= client.post("/arima/check-model/", json=model).status_code < 300
    predictions = response.json["predictions"]
    assert len(predictions) == predict["n"]
    assert all(p["lower"] <= p["value"] <= p["upper"] for p in predictions)

    response = client.post("/arima/predict/", json={
        "arima": model,
        "fit": data,
        "predict": predict,
    })
    assert 200 <= response.status_code < 300
    assert response.json["predictions"] == predictions
