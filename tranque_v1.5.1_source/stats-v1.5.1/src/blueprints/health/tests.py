def test_health(client):
    """Health check returns an OK status.
    """
    response = client.get("/health/")
    assert 200 <= response.status_code < 300


def test_config(client):
    """Config inspection returns an OK status. Also, the returned values
    don't include sensitive information.

    """
    response = client.get("/health/config/")
    assert 200 <= response.status_code < 300
    assert response.json["SECRET_KEY"] == "<hidden>"
    assert response.json["SENTRY_DSN"] == "<hidden>"
