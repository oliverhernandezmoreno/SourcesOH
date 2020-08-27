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

# Create E700 form and version
"${BASE_DIR}/manage.py" createreportform \
                        e700 \
                        "${DIR}/form-schema.json" \
                        --name e700 \
                        --description "Formulario E700"

echo "[setup.sh] Setup is done"
