#!/usr/bin/env bash

set -e

BASE_DIR="/usr/src/app"
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"

while ! nc -z storage 9000
do
    echo "[setup.sh] Waiting for storage:9000"
    sleep 1
done

targets=(
    "dep01"
    "dep02"
    "dep03"
    "dep04"
    "dep05"
    "dep06"
    "dep07"
    "dep08"
    "dep09"
    "dep10"
)

# Initial computation
loaded_data=$(
    curl "http://elasticsearch:9200/derived-*/_search" \
         -s \
         -X POST \
         -H "Content-Type: application/json" \
         -d '{"query": {"regexp": {"name": ".*emac-mvp.*"}}}' \
        | jq -Mr .hits.total.value
)

if [[ "${loaded_data}" == "0" ]]
then
    for target in "${targets[@]}"
    do
        find "${DIR}" -type f | grep 'data-' | sort | while read -r datafile
        do
            "${BASE_DIR}/manage.py" etloperation --executor "emac_rev0" "${target}" "${datafile}"
        done
    done
fi
