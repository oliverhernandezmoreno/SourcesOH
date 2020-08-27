#!/usr/bin/env bash

set -e

echo "[entrypoint.amqpconsumer.sh] Waiting for dependencies"
deps=(
    "${DATABASE_HOST:-localhost}:${DATABASE_PORT:-5432}"
)

if [[ $@ == *"--smc"* ]]
then
  # manage.py runconsumer --smc"
  deps+=("${SMC_AMQP_HOST:-localhost}:${SMC_AMQP_PORT:-5672}")
else
  # manage.py runconsumer"
  deps+=("${AMQP_HOST:-localhost}:${AMQP_PORT:-5672}")
fi

for dep in "${deps[@]}"
do
    IFS=: read -r service port <<< "$dep"
    while ! nc -z "$service" "$port"
    do
        echo "[entrypoint.amqpconsumer.sh] Waiting for $service:$port"
        sleep 1
    done
done
echo "[entrypoint.amqpconsumer.sh] Dependencies are running"

echo "[entrypoint.amqpconsumer.sh] Starting '$@'"
exec "$@"
