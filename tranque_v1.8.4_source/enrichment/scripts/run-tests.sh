#!/usr/bin/env bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"

if ! nc -z "${ELASTICSEARCH_HOST:-localhost}" "${ELASTICSEARCH_PORT:-9200}"
then
    echo "[run-tests.sh] Lifting elasticsearch"
    ELASTICSEARCH_CONTAINER=$(
        docker run --rm \
               -e "discovery.type=single-node" \
               --network=host \
               -d docker.elastic.co/elasticsearch/elasticsearch-oss:7.3.1
    )
fi

if ! nc -z "${DATABASE_HOST:-localhost}" "${DATABASE_PORT:-5432}"
then
    echo "[run-tests.sh] Lifting postgres"
    POSTGRES_CONTAINER=$(
        docker run --rm \
               -e "POSTGRES_DB=${DATABASE_NAME:-backend}" \
               -e "POSTGRES_USER=${DATABASE_USER:-backend}" \
               -e "POSTGRES_PASSWORD=${DATABASE_PASSWORD:-backend}" \
               --network=host \
               -d mdillon/postgis:10
    )
fi

function dockerstop {
    if [[ -z "$KEEP_CONTAINERS" ]]
    then
        if [[ -n "$ELASTICSEARCH_CONTAINER" ]]
        then
            echo "[run-tests.sh] Stopping elasticsearch"
            docker stop "$ELASTICSEARCH_CONTAINER"
        fi
        if [[ -n "$POSTGRES_CONTAINER" ]]
        then
            echo "[run-tests.sh] Stopping postgres"
            docker stop "$POSTGRES_CONTAINER"
        fi
    fi
}
trap dockerstop EXIT

"${DIR}/setup-elasticsearch.sh"
"${DIR}/setup-postgres.sh"

echo "[run-tests.sh] Running tests"
yarn test "$@"
