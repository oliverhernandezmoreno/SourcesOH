#!/usr/bin/env bash

attempts="20"

while
    output=$(
        curl -sS \
             -X PUT "${ELASTICSEARCH_PROTOCOL:-http}://${ELASTICSEARCH_HOST:-localhost}:${ELASTICSEARCH_PORT:-9200}/_template/timeseries" \
             -H "Content-Type: application/json" \
             --data-binary @- 2>&1 <<EOF
{
  "index_patterns": ["raw-*", "derived-*", "test-*"],
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0,
    "index.store.type": "niofs"
  },
  "mappings": {
    "dynamic": false,
    "_source": {
      "includes": [
        "@timestamp",
        "value",
        "name",
        "coords.x",
        "coords.y",
        "coords.z",
        "sequence",
        "labels.key",
        "labels.value",
        "meta",
        "dependencies"
      ]
    },
    "properties": {
      "@timestamp": {"type": "date"},
      "value": {"type": "double"},
      "name": {"type": "keyword"},
      "coords": {
        "type": "object",
        "dynamic": false,
        "properties": {
          "x": {"type": "double"},
          "y": {"type": "double"},
          "z": {"type": "double"}
        }
      },
      "sequence": {"type": "integer"},
      "labels": {
        "type": "nested",
        "dynamic": false,
        "properties": {
          "key": {"type": "keyword"},
          "value": {"type": "keyword"}
        }
      },
      "meta": {
        "type": "object",
        "enabled": false
      },
      "dependencies": {"type": "keyword"}
    }
  }
}
EOF
    )
    [[ "$output" != '{"acknowledged":true}' ]]
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
