#!/bin/bash

set -e

. /cron.env

TRIGGERED="$(date -Iseconds)"

touch /tmp/last-trigger-__PERIOD__
LAST_TRIGGER="$(cat /tmp/last-trigger-__PERIOD__)"

echo "${TRIGGERED}" > /tmp/last-trigger-__PERIOD__

curl -H "Authorization: Token ${BACKEND_TOKEN}" \
     -H "Content-Type: application/json" \
     -X POST \
     "${BACKEND_SCHEME:-http}://${BACKEND_HOST:-localhost}:${BACKEND_PORT:-8000}/api/${BACKEND_API_VERSION:-v1}/cron/__PERIOD__/" \
     -d '{"period":"__PERIOD__","lastTrigger":"${LAST_TRIGGER}","currentTrigger":"${TRIGGERED}"}'
