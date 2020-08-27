import datetime
import functools
import hashlib
import json
import logging

import requests

import settings

logger = logging.getLogger(__name__)


def inject_metadata(event):
    """Adds trace metadata to the event"""
    return {
        **event,
        "labels": [
            *event.get("labels", []),
            {"key": "beats-producer", "value": "http-poller-producer"},
            {"key": "http-poller-producer-version", "value": settings.COMMIT or ""},
        ],
    }


@functools.lru_cache()
def script_module():
    """Imports and caches the script module"""
    with open(settings.SCRIPT_FILE) as script_file:
        ast = compile(script_file.read(), settings.SCRIPT_FILE, "exec")
        module = {}
        exec(ast, module, module)
    assert "build_request" in module, "Module must have a build_request procedure"
    assert "parse_response" in module, "Module must have a parse_response procedure"

    class modulewrapper:
        def __init__(self, module):
            self.module = module

        def build_request(self):
            return self.module["build_request"]()

        def parse_response(self, *args, **kwargs):
            return self.module["parse_response"](*args, **kwargs)

    return modulewrapper(module)


class PollError(Exception):
    """Non-critical errors during a poll cycle"""
    pass


def fail(condition, message):
    """Raise a poll error"""
    if not condition:
        raise PollError(message)


def event_signature(event):
    """Computes a signature for a json-encodable thing"""
    signature = hashlib.sha1()
    signature.update(json.dumps(event).encode())
    return signature.digest()


class Producer:

    def __init__(self):
        # The events sent on the last poll cycle
        self.sent_signatures = set()

    def post(self, *args, **kwargs):
        return requests.post(*args, **kwargs)

    def get(self, *args, **kwargs):
        return requests.get(*args, **kwargs)

    def send_events(self, events, endpoint):
        """Send events to the specified consumer endpoint"""
        if settings.FAKE_SEND:
            logger.info(f"Fake-sending to {endpoint} {len(events)} events")
            logger.debug(f"Fake-sending to {endpoint}, {json.dumps(events, indent=2)}")
            return True
        try:
            response = self.post(
                endpoint,
                headers={
                    "Authorization": f"Token {settings.CONSUMER_PASSWORD}",
                    "Content-Type": "application/json",
                },
                data=json.dumps(events),
                timeout=settings.CONSUMER_TIMEOUT,
            )
            if 200 <= response.status_code < 300:
                logger.info(f"Consumer response {response.json()}")
                return True
        except requests.exceptions.ConnectionError:
            logger.error(f"Couldn't post events to {endpoint}")
        return False

    # Poll cycle:
    # 1. invoke script
    # 2. request with script's url, params & headers
    # 3. collect results and compute signatures
    # 4. diff with previous state
    # 5. inject metadata into new events
    # 6. send new events to consumer

    def poll_cycle(self):
        logger.info("Starting poll cycle")
        events = []
        for url, params, headers in script_module().build_request():
            logger.debug(f"Poll parameters are {url}, {params}, {headers}")
            try:
                response = self.get(url=url, params=params, headers=headers, timeout=settings.POLL_TIMEOUT)
            except requests.exceptions.ConnectionError:
                fail(False, "Couldn't complete poll request")
            except requests.exceptions.Timeout:
                fail(False, "Poll request timed out")
            logger.debug(f"Response is {response.status_code}")
            fail(200 <= response.status_code < 300, f"Response status is {response.status_code}")
            events.extend(script_module().parse_response(response, url, params, headers))

        logger.debug(f"{len(events)} events loaded")
        event_catalog = {
            event_signature(event): event
            for event in events
        }
        diff = set(event_catalog.keys()) - self.sent_signatures
        if not diff:
            logger.info("No new events found")
            return
        logger.info(f"{len(diff)} new events found")

        sent = all(
            self.send_events([
                inject_metadata(event_catalog[signature])
                for signature in diff
            ], consumer_endpoint)
            for consumer_endpoint in settings.CONSUMER_ENDPOINT
        )
        if sent:
            self.sent_signatures.clear()
            self.sent_signatures.update(set(event_catalog.keys()))

    # Heartbeat cycle:
    # 1. send heartbeat to consumer

    def heartbeat_cycle(self):
        for consumer_endpoint in settings.CONSUMER_ENDPOINT:
            self.send_events([inject_metadata({
                "name": settings.HEARTBEAT_NAME,
                "value": 1.0,
                "@timestamp": f"{datetime.datetime.utcnow().isoformat()}Z",
            })], consumer_endpoint)
