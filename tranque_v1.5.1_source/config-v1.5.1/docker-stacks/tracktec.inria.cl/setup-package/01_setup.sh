#!/usr/bin/env bash

set -e

BASE_DIR="/usr/src/app"
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"

# Load zones
"${BASE_DIR}/manage.py" loadzones

# Load targets (fake, dev-specific)
"${BASE_DIR}/manage.py" loadtargets "${DIR}/targets-fake.xls"

# Count targets in each zone, recursively
"${BASE_DIR}/manage.py" tallytargets

# Load infos
"${BASE_DIR}/manage.py" loadinfos

# Create users
"${BASE_DIR}/manage.py" loadprofiles "${DIR}/profiles.yml"

# Load global remote to create minio bucket
"${BASE_DIR}/manage.py" loadremotes "${DIR}/remotes.yml"

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
