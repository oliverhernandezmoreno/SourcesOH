#!/bin/sh

while ! nc -z "${ELASTICSEARCH_HOST:-localhost}" "${ELASTICSEARCH_PORT:-9200}"
do
    echo "Waiting for elasticsearch"
    sleep 1
done

exec "$@"
