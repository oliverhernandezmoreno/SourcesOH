#!/usr/bin/env bash

set -e

/usr/src/app/manage.py loadzones
/usr/src/app/manage.py loadtargets
/usr/src/app/manage.py tallytargets
/usr/src/app/manage.py loadinfos
