#!/usr/bin/env bash

set -e

BASE_DIR="/usr/src/app"
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"

# Load zones
"${BASE_DIR}/manage.py" loadzones

# Load targets (real + fake dev-specific)
"${BASE_DIR}/manage.py" loadtargets "${DIR}/targets.xls"

# Count targets in each zone, recursively
"${BASE_DIR}/manage.py" tallytargets

# Load infos
"${BASE_DIR}/manage.py" loadinfos

# Create remotes and buckets
"${BASE_DIR}/manage.py" loadremotes "${DIR}/remotes.yml"

# Set maps account
"${BASE_DIR}/manage.py" loaddata "${DIR}/site-config.json"

# Set default global authority roles groups
"${BASE_DIR}/manage.py" createglobalgroups
