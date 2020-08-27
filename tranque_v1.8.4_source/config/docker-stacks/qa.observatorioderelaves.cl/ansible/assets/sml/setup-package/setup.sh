#!/usr/bin/env bash

set -e

BASE_DIR="/usr/src/app"
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"

# Ensure zones and targets are loaded
"${BASE_DIR}/manage.py" loadzones
"${BASE_DIR}/manage.py" loadtargets

# Create remotes and buckets
"${BASE_DIR}/manage.py" loadremotes "${DIR}/remotes.yml"

# Remove targets not linked to remotes, and annotate remaining targets
"${BASE_DIR}/manage.py" shell <<EOF
from targets.models import Target
Target.objects.filter(remote__isnull=True).delete()
for t in Target.objects.all():
    t.name = f"{' '.join(t.canonical_name.split('-')).title()} ({' '.join(t.remote.namespace.upper().split('-'))})"
    t.save()
EOF

# Create users and profiles
"${BASE_DIR}/manage.py" shell <<EOF
import json

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group

from entities.models import UserProfile
from targets.models import Target

with open("${DIR}/__REPLACED_USERS_FILE__") as f:
    userdata = json.load(f)

User = get_user_model()

for data in userdata:
    user = User.objects.filter(username=data.get("username")).first()
    if user is not None:
        print("User", data.get("username"), "already exists, skipping setup")
        continue
    user = User.objects.create_user(
        data.get("username"),
        email=data.get("email"),
        password=data.get("password"),
    )
    group = Group.objects.get(name=data.get("group"))
    user.groups.set([group])
    profile = UserProfile.objects.get(user=user)
    targets = Target.objects.filter(canonical_name__in=data.get("targets", [])).all()
    profile.targets.set(targets)
    profile.save()
    print("User", data.get("username"), "was setup correctly")

EOF

# Create points
"${BASE_DIR}/manage.py" loaddatasources "${DIR}/points.yml"

# Install emac index
"${BASE_DIR}/manage.py" applytargetmanifest __REPLACED_TARGET__ emac

# Configure frequencies for specific SGT series
"${BASE_DIR}/manage.py" configuretimeseries "${DIR}/emac-config.yml"
