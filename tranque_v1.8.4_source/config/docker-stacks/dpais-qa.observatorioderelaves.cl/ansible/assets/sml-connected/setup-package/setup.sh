#!/usr/bin/env bash

set -e

BASE_DIR="/usr/src/app"
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"

while ! nc -z storage 9000
do
    echo "[setup.sh] Waiting for storage:9000"
    sleep 1
done

# Load zones
"${BASE_DIR}/manage.py" loadzones

# Load targets (fake, demo-specific)
"${BASE_DIR}/manage.py" loadtargets "${DIR}/targets-fake.xls"

# Count targets in each zone, recursively
"${BASE_DIR}/manage.py" tallytargets

# Load static text contents
"${BASE_DIR}/manage.py" loadinfos

# Create remotes and buckets
"${BASE_DIR}/manage.py" loadremotes "${DIR}/remotes.yml"

# Create users
"${BASE_DIR}/manage.py" loadprofiles "${DIR}/profiles.yml"

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

for target in "${targets[@]}"
do
    # Create points
    sed -e "s/__REPLACED_TARGET__/${target}/g" \
        < "${DIR}/points.yml" \
        > "${DIR}/points-${target}.yml"
    "${BASE_DIR}/manage.py" loaddatasources "${DIR}/points-${target}.yml"

    # Install EMAC index
    "${BASE_DIR}/manage.py" applytargetmanifest "${target}" emac
done

# Initial computation
loaded_data=$(
    curl "http://elasticsearch:9200/derived-*/_search" \
         -s \
         -X POST \
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
