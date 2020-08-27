#!/usr/bin/env bash

src/manage.py migrate
src/manage.py loadzones
src/manage.py loadtargets2019
src/manage.py tallytargets
src/manage.py loadinfos

src/manage.py assertsuperuser admin admin
src/manage.py assertcredentials internal internal-token
