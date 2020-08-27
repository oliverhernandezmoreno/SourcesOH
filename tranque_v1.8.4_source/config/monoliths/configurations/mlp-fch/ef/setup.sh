#!/bin/bash

set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"

/usr/src/app/manage.py loaddatasources "${DIR}/setup.yml" el-mauro
/usr/src/app/manage.py applytargetmanifest el-mauro ef
/usr/src/app/manage.py configuretimeseries "${DIR}/setup.yml" el-mauro
