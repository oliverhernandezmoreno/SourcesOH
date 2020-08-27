#!/usr/bin/env bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"

if ! nc -z localhost 9000
then
    echo "[run-tests.sh] Lifting minio"
    MINIO_CONTAINER=$(
        docker run --rm \
               -e MINIO_ACCESS_KEY=storagekey \
               -e MINIO_SECRET_KEY=storagesecret \
               -p 9000:9000 \
               --entrypoint '' \
               -d minio/minio:RELEASE.2019-04-23T23-50-36Z \
               sh -c 'mkdir -p /data/test && minio server /data'
    )
fi

if ! nc -z "${DATABASE_HOST:-localhost}" "${DATABASE_PORT:-5432}"
then
    echo "[run-tests.sh] Lifting postgis"
    POSTGIS_CONTAINER=$(
        docker run --rm \
               -e POSTGRES_DB=backend \
               -e POSTGRES_USER=backend \
               -e POSTGRES_PASSWORD=backend \
               -p 5432:5432 \
               -d mdillon/postgis:10
    )
fi

if ! nc -z "${ELASTICSEARCH_HOST:-localhost}" "${ELASTICSEARCH_PORT:-9200}"
then
    echo "[run-tests.sh] Lifting elasticsearch"
    ELASTICSEARCH_CONTAINER=$(
        docker run --rm \
               -e "discovery.type=single-node" \
               -p 9200:9200 \
               -d docker.elastic.co/elasticsearch/elasticsearch-oss:7.3.1
    )
fi

function dockerstop {
    if [[ -z "$KEEP_CONTAINERS" ]]
    then
        if [[ -n "$MINIO_CONTAINER" ]]
        then
            echo "[run-tests.sh] Stopping minio"
            docker stop "$MINIO_CONTAINER"
        fi

        if [[ -n "$ELASTICSEARCH_CONTAINER" ]]
        then
            echo "[run-tests.sh] Stopping elasticsearch"
            docker stop "$ELASTICSEARCH_CONTAINER"
        fi

        if [[ -n "$POSTGIS_CONTAINER" ]]
        then
            echo "[run-tests.sh] Stopping postgis"
            docker stop "$POSTGIS_CONTAINER"
        fi
    fi
}
trap dockerstop EXIT

while ! nc -z "${DATABASE_HOST:-localhost}" "${DATABASE_PORT:-5432}"
do
    echo "[run-tests.sh] Waiting for postgis"
    sleep 3
done

sleep 1

echo "[run-tests.sh] Running tests"
coverage erase
DEFAULT_FILE_STORAGE=storages.backends.s3boto3.S3Boto3Storage \
  S3_ENDPOINT_URL=http://localhost:9000 \
  S3_ACCESS_KEY_ID=storagekey \
  S3_SECRET_ACCESS_KEY=storagesecret \
  S3_BUCKET_NAME=test \
  coverage run --branch --omit=**/migrations/*.*,**/tests/*.* --source=src src/manage.py test "$@"
