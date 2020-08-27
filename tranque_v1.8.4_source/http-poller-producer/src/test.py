from itertools import islice
from unittest.mock import MagicMock

import producer
import schedule
import settings


def test_frozen_settings():
    frozen = settings.freeze()
    assert "COMMIT" in frozen
    assert "SCRIPT_FILE" in frozen


def test_scheduler():
    calls = {"f1": 0, "f2": 0, "f3": 0}

    def f1():
        calls.update(f1=calls["f1"] + 1)

    def f2():
        calls.update(f2=calls["f2"] + 1)

    def f3():
        calls.update(f3=calls["f3"] + 1)

    now = schedule.now()
    schedule.execute_schedules(
        (f1, [now, now + 0.3, now + 0.6, now + 0.9]),
        (f2, islice(schedule.make_regular_schedule(now, 0.2), 6)),
        (f3, [now, now - 0.25, now + 0.25, now + 0.5, now + 0.75, now + 1]),
        minimum_sleep_period=0.1,
    )
    assert calls["f1"] == 4
    assert calls["f2"] == 6
    # expect one call of f3 to have been skipped over
    assert calls["f3"] == 5


class MockedResponse:

    def __init__(self, body):
        self.status_code = 200
        self.body = body

    def json(self):
        return self.body


def test_producer():
    response_get = [{
        "SrvCod": "10002241-11",
        "Fec_FechaCaptura": "01-01-2019 10:00:00",
        "Num_ValorValidado": 3,
    }]
    response_post = {"nothing": "here"}

    p = producer.Producer()
    p.get = MagicMock(return_value=MockedResponse(response_get))
    p.post = MagicMock(return_value=MockedResponse(response_post))
    p.poll_cycle()
    assert len(p.sent_signatures) == 1
    p.get.assert_called_once()
    p.post.assert_called_once()

    p = producer.Producer()
    p.get = MagicMock(return_value=MockedResponse(response_get))
    p.post = MagicMock(return_value=MockedResponse(response_post))
    p.heartbeat_cycle()
    assert len(p.sent_signatures) == 0
    p.get.assert_not_called()
    p.post.assert_called_once()
