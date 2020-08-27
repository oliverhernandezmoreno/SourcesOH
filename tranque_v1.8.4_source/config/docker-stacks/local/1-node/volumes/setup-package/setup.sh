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

# Load targets using the latest spreadsheet
"${BASE_DIR}/manage.py" loadtargets2019

# Count targets in each zone
"${BASE_DIR}/manage.py" tallytargets

# Load static text contents
"${BASE_DIR}/manage.py" loadinfos

# Create remotes and buckets
"${BASE_DIR}/manage.py" loadremotes "${DIR}/remotes.yml"

# Create backups bucket
"${BASE_DIR}/manage.py" shell <<EOF
from remotes.models import Remote

Remote(bucket="backups").create_bucket()
EOF

# Create users
"${BASE_DIR}/manage.py" loadprofiles "${DIR}/profiles.yml"

# Add omniuser to all groups
"${BASE_DIR}/manage.py" shell <<EOF
from django.contrib.auth.models import User, Group

User.objects.get(username="omniuser").groups.add(Group.objects.get(name="authority"))
User.objects.get(username="omniuser").groups.add(Group.objects.get(name="analyst"))
EOF
