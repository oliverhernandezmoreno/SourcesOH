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

# Load targets (official)
"${BASE_DIR}/manage.py" loadtargets
# Load targets (fake, demo-specific)
"${BASE_DIR}/manage.py" loadtargets --force "${DIR}/targets-fake.xls"

# Count targets in each zone, recursively
"${BASE_DIR}/manage.py" tallytargets

# Load static text contents
"${BASE_DIR}/manage.py" loadinfos

# Create remotes and buckets
"${BASE_DIR}/manage.py" loadremotes "${DIR}/remotes.yml"

# Create users
"${BASE_DIR}/manage.py" loadprofiles "${DIR}/profiles.yml"

# Set maps account
"${BASE_DIR}/manage.py" loaddata "${DIR}/site-config.json"
