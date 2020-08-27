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

# Create a demo user
"${BASE_DIR}/manage.py" loadprofiles "${DIR}/profiles.yml"

# Create points
"${BASE_DIR}/manage.py" loaddatasources "${DIR}/points-primero.yml"
"${BASE_DIR}/manage.py" loaddatasources "${DIR}/points-segundo.yml"
"${BASE_DIR}/manage.py" loaddatasources "${DIR}/points-tercero.yml"
"${BASE_DIR}/manage.py" loaddatasources "${DIR}/points-cuarto.yml"

# Install EMAC index
"${BASE_DIR}/manage.py" applytargetmanifest primero emac
"${BASE_DIR}/manage.py" applytargetmanifest segundo emac
"${BASE_DIR}/manage.py" applytargetmanifest tercero emac
"${BASE_DIR}/manage.py" applytargetmanifest cuarto emac

# Configure frequencies for specific SGT series
"${BASE_DIR}/manage.py" configuretimeseries "${DIR}/emac-config-primero.yml"
"${BASE_DIR}/manage.py" configuretimeseries "${DIR}/emac-config-segundo.yml"
"${BASE_DIR}/manage.py" configuretimeseries "${DIR}/emac-config-tercero.yml"
"${BASE_DIR}/manage.py" configuretimeseries "${DIR}/emac-config-cuarto.yml"

# Create data sources and groups
"${BASE_DIR}/manage.py" loaddatasources "${DIR}/sources-primero.yml"
"${BASE_DIR}/manage.py" loaddatasources "${DIR}/sources-segundo.yml"
"${BASE_DIR}/manage.py" loaddatasources "${DIR}/sources-tercero.yml"
"${BASE_DIR}/manage.py" loaddatasources "${DIR}/sources-cuarto.yml"

# Install EF index
"${BASE_DIR}/manage.py" applytargetmanifest primero ef
"${BASE_DIR}/manage.py" applytargetmanifest segundo ef
"${BASE_DIR}/manage.py" applytargetmanifest tercero ef
"${BASE_DIR}/manage.py" applytargetmanifest cuarto ef

# Configure thresholds for specific EF series
"${BASE_DIR}/manage.py" configuretimeseries "${DIR}/ef-config-primero.yml"
"${BASE_DIR}/manage.py" configuretimeseries "${DIR}/ef-config-segundo.yml"
"${BASE_DIR}/manage.py" configuretimeseries "${DIR}/ef-config-tercero.yml"
"${BASE_DIR}/manage.py" configuretimeseries "${DIR}/ef-config-cuarto.yml"

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
    # cat "${DIR}/ef-data.ndjson" \
    #     | sed -e 's/__REPLACED_TARGET__/primero/g' \
    #     | "${BASE_DIR}/es-load" elasticsearch:9200

    cat "${DIR}/ef-data.ndjson" \
        | sed -e 's/__REPLACED_TARGET__/segundo/g' \
        | "${BASE_DIR}/es-load" elasticsearch:9200

    # cat "${DIR}/ef-data.ndjson" \
    #     | sed -e 's/__REPLACED_TARGET__/tercero/g' \
    #     | "${BASE_DIR}/es-load" elasticsearch:9200

    # cat "${DIR}/ef-data.ndjson" \
    #     | sed -e 's/__REPLACED_TARGET__/cuarto/g' \
    #     | "${BASE_DIR}/es-load" elasticsearch:9200
else
    echo "[setup.sh] EF data was already loaded"
fi

echo "[setup.sh] Setup is done"
