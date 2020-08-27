#!/usr/bin/env bash

set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"

if ! nc -z "${DATABASE_HOST:-localhost}" "${DATABASE_PORT:-5432}"
then
    echo "[run-docker.sh] Lifting postgis"
    POSTGIS_CONTAINER=$(
        docker run --rm \
               -e POSTGRES_DB=backend \
               -e POSTGRES_USER=backend \
               -e POSTGRES_PASSWORD=backend \
               -v "tranque_postgis:/var/lib/postgresql/data" \
               -p "5432:5432" \
               -d mdillon/postgis:10
    )
fi

if ! nc -z "${ELASTICSEARCH_HOST:-localhost}" "${ELASTICSEARCH_PORT:-9200}"
then
    echo "[run-docker.sh] Lifting elasticsearch"
    ELASTICSEARCH_CONTAINER=$(
        docker run --rm \
               -e "discovery.type=single-node" \
               -v "tranque_elasticsearch:/usr/share/elasticsearch/data" \
               -p "9200:9200" \
               -d docker.elastic.co/elasticsearch/elasticsearch-oss:7.3.1
    )
fi

if ! nc -z "${AMQP_HOST:-localhost}" "${AMQP_PORT:-5672}"
then
    echo "[run-docker.sh] Lifting rabbitmq"
    RABBITMQ_CONTAINER=$(
        docker run --rm \
               -p "5672:5672" \
               -d rabbitmq:3.7.8-management-alpine
    )
fi

if ! nc -z "${REDIS_HOST:-localhost}" "${REDIS_PORT:-6379}"
then
    echo "[run-docker.sh] Lifting redis"
    REDIS_CONTAINER=$(
        docker run --rm \
               -p "6379:6379" \
               -d redis:4-alpine
    )
fi


"${DIR}/pull-profiles.sh"

while ! nc -z "${DATABASE_HOST:-localhost}" "${DATABASE_PORT:-5432}"
do
    echo "[run-docker.sh] Waiting for postgis"
    sleep 3
done

if [[ -n "$POSTGIS_CONTAINER" ]]
then
    "${DIR}/setup-postgis.sh"
fi

"${DIR}/setup-elasticsearch.sh"


if [[ -n "$KIBANA" ]]
then
    if ! nc -z localhost 5601
    then
        echo "[run-docker.sh] Lifting kibana"
        docker run --rm --network=host -d \
               -e SERVER_BASEPATH=/kibana \
               -e SERVER_REWRITEBASEPATH=false \
               -e ELASTICSEARCH_HOSTS="http://localhost:9200" \
               docker.elastic.co/kibana/kibana-oss:7.3.1
        while ! nc -z localhost 5601
        do
            echo "[run-docker.sh] Waiting for kibana"
            sleep 3
        done
    else
        echo "[run-docker.sh] Kibana is already running"
    fi
fi

echo "[run-docker.sh] All set up!"
