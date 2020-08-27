#!/bin/sh

set -e

echo "[entrypoint.sh] Waiting for dependencies"
while ! nc -z "${REDIS_HOST:-localhost}" "${REDIS_PORT:-6379}"
do
    echo "[entrypoint.sh] Waiting for redis"
    sleep 1
done
echo "[entrypoint.sh] Dependencies are running"

echo "[entrypoint.sh] Starting '$@'"
exec "$@"
