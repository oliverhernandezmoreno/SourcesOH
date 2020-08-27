#!/usr/bin/env bash

set -e

if ! nc -z localhost 5432
then
    echo "[local-tests.sh] Lifting postgis"
    POSTGIS_CONTAINER=$(
        docker run --rm \
               -e POSTGRES_DB=backend \
               -e POSTGRES_USER=backend \
               -e POSTGRES_PASSWORD=backend \
               --network=host \
               -d mdillon/postgis:10
    )
fi

if ! nc -z localhost 9200
then
    echo "[local-tests.sh] Lifting elasticsearch"
    ELASTICSEARCH_CONTAINER=$(
        docker run --rm \
               -e "discovery.type=single-node" \
               --network=host \
               -d docker.elastic.co/elasticsearch/elasticsearch-oss:7.3.1
    )
fi

if ! nc -z localhost 9000
then
    echo "[local-tests.sh] Lifting minio"
    STORAGE_CONTAINER=$(
        docker run --rm \
               -e "MINIO_ACCESS_KEY=storagekey" \
               -e "MINIO_SECRET_KEY=storagesecret" \
               --network=host \
               -d minio/minio:RELEASE.2019-04-23T23-50-36Z \
               server /data
    )
fi

function dockerstop {
    if [[ -z "$KEEP_CONTAINERS" ]]
    then
        if [[ -n "$STORAGE_CONTAINER" ]]
        then
            echo "[local-tests.sh] Stopping minio"
            docker stop "$STORAGE_CONTAINER"
        fi

        if [[ -n "$ELASTICSEARCH_CONTAINER" ]]
        then
            echo "[local-tests.sh] Stopping elasticsearch"
            docker stop "$ELASTICSEARCH_CONTAINER"
        fi

        if [[ -n "$POSTGIS_CONTAINER" ]]
        then
            echo "[local-tests.sh] Stopping postgis"
            docker stop "$POSTGIS_CONTAINER"
        fi
    fi
}
trap dockerstop EXIT

while ! nc -z localhost 5432
do
    echo "[local-tests.sh] Waiting for postgis"
    sleep 3
done

while ! nc -z localhost 9200
do
    echo "[local-tests.sh] Waiting for elasticsearch"
    sleep 3
done

while [[ "$(curl -s localhost:9200/_cat/health?h=status)" != "green" ]]
do
    echo "[local-tests.sh] Waiting for elasticsearch"
    sleep 3
done

while ! nc -z localhost 9000
do
    echo "[local-tests.sh] Waiting for minio"
    sleep 3
done

pytest "$@"
