#!/bin/sh

set -e

command="$@"

echo "[entrypoint.sh] Waiting for dependencies"

set "${AMQP_HOST:-localhost}:${AMQP_PORT:-5672}" \
    "${DATABASE_HOST:-localhost}:${DATABASE_PORT:-5432}" \
    "${ELASTICSEARCH_HOST:-localhost}:${ELASTICSEARCH_PORT:-9200}"

for dep
do
    service=$(echo -n "$dep" | cut -d ":" -f 1)
    port=$(echo -n "$dep" | cut -d ":" -f 2)
    while ! nc -z "$service" "$port"
    do
        echo "[entrypoint.sh] Waiting for $service:$port"
        sleep 1
    done
done
echo "[entrypoint.sh] Dependencies are running"

echo "[entrypoint.sh] Checking db schema"
yarn setup-db check-schema

echo "[entrypoint.sh] Starting '$command'"
exec $command
