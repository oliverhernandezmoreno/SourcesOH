#!/usr/bin/env bash

attempts="20"
es_host="${ELASTICSEARCH_HOST:-localhost}:${ELASTICSEARCH_PORT:-9200}"

while
    output=$(
        curl -sS \
             "${es_host}/_cat/health?h=status" 2>&1
    )
    [[ "$output" != "green" ]]
do
    attempts=$((attempts-1))
    if [[ "$attempts" == "0" ]]
    then
        echo "[setup-elasticsearch.sh] Couldn't setup elasticsearch"
        exit 1
    fi
    echo "[setup-elasticsearch.sh] Waiting for elasticsearch"
    sleep 3
done
