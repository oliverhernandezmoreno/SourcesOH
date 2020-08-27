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
"${BASE_DIR}/manage.py" loadtargets "${DIR}/targets.xls"

# Count targets in each zone, recursively
"${BASE_DIR}/manage.py" tallytargets

# Load static text contents
"${BASE_DIR}/manage.py" loadinfos

# Create remotes and buckets
"${BASE_DIR}/manage.py" loadremotes "${DIR}/remotes.yml"

# Create users
"${BASE_DIR}/manage.py" loadprofiles "${DIR}/profiles.yml"

targets=(
    'dep01'
    'dep02'
    'dep03'
    'dep04'
    'dep05'
    'dep06'
    'dep07'
    'dep08'
    'dep09'
    'dep10'
    'dep11'
    'dep12'
    'dep13'
    'dep14'
    'dep15'
    'dep16'
    'dep17'
    'dep18'
    'dep19'
    'dep20'
    'dep21'
    'dep22'
    'dep23'
    'dep24'
    'dep25'
    'dep26'
    'dep27'
    'dep28'
    'dep29'
    'dep30'
    'dep31'
    'dep32'
    'dep33'
    'dep34'
    'dep35'
    'dep36'
    'dep37'
    'dep38'
    'dep39'
    'dep40'
)

for target in "${targets[@]}"
do
    # Create sources
    sed -e "s/__REPLACED_TARGET__/${target}/g" \
        < "${DIR}/sources.yml" \
        > "${DIR}/sources-${target}.yml"
    "${BASE_DIR}/manage.py" loaddatasources "${DIR}/sources-${target}.yml"

    # Install EF index
    "${BASE_DIR}/manage.py" applytargetmanifest "${target}" ef

    # Configure thresholds
    sed -e "s/__REPLACED_TARGET__/${target}/g" \
        < "${DIR}/ef-config.yml" \
        > "${DIR}/ef-config-${target}.yml"
    "${BASE_DIR}/manage.py" configuretimeseries "${DIR}/ef-config-${target}.yml"
done

# Load EF data, only if it wasn't loaded beforehand
LOADED=$(
    curl "http://elasticsearch:9200/derived-*/_search" \
         -X POST \
         -H "Content-Type: application/json" \
         -d '{"query":{"regexp":{"name":".*ef-mvp.*"}}}' \
        | jq -Mc .hits.total.value
)
if [[ "${LOADED}" == "0" ]]
then
    if [[ -f "${DIR}/ef-data.ndjson.gz" ]]
    then
        gunzip "${DIR}/ef-data.ndjson.gz"
    fi
    read -ra datatargets <<< "dep01 dep02 dep03"
    for target in "${datatargets[@]}"
    do
        cat "${DIR}/ef-data.ndjson" \
            | sed -e "s/__REPLACED_TARGET__/${target}/g" \
            | "${BASE_DIR}/es-load" elasticsearch:9200
    done
else
    echo "[setup.sh] EF data was already loaded"
fi

echo "[setup.sh] Setup is done"
