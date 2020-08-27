#!/usr/bin/env bash

set -e

# Ensure we're using the latest images
../backend/scripts/pull-profiles.sh
docker-compose -f ../docker-compose.yml -f ../docker-compose.archivist.yml pull
docker-compose -f ../docker-compose.yml -f ../docker-compose.archivist.yml build --pull

# Migrations and fixtures
docker-compose run --rm backend ./manage.py migrate
docker-compose run --rm backend ./manage.py assertsuperuser admin admin
docker-compose run --rm backend ./manage.py loaddata fixtures/groups.json
docker-compose run --rm backend ./manage.py loadzones
docker-compose run --rm backend ./manage.py loadtargets2019
docker-compose run --rm backend ./manage.py tallytargets
docker-compose run --rm backend ./manage.py loadinfos
docker-compose run --rm backend ./manage.py load_user_actions
docker-compose run --rm backend ./manage.py load_user_roles
docker-compose run --rm -v $(pwd):/recipe backend ./manage.py createreportform \
               e700 \
               /recipe/e700-schema.json \
               --description "Formulario E700" \
               --version-code 18

# Users
docker-compose run --rm -v $(pwd):/recipe backend ./manage.py loadprofiles /recipe/profiles.yml

# EF setup
docker-compose run --rm -v $(pwd):/recipe backend ./manage.py loaddatasources /recipe/ef-setup.yml el-mauro
docker-compose run --rm -v $(pwd):/recipe backend ./manage.py applytargetmanifest el-mauro ef
docker-compose run --rm -v $(pwd):/recipe backend ./manage.py configuretimeseries /recipe/ef-setup.yml el-mauro

# EMAC setup
docker-compose run --rm -v $(pwd):/recipe backend ./manage.py loaddatasources /recipe/emac-setup.yml el-mauro
docker-compose run --rm -v $(pwd):/recipe backend ./manage.py applytargetmanifest el-mauro emac
docker-compose run --rm -v $(pwd):/recipe backend ./manage.py configuretimeseries /recipe/emac-setup.yml el-mauro

# Groups for permissions
docker-compose run --rm -v $(pwd):/recipe backend ./manage.py createtargetgroups el-mauro

# Data simulations: EF and a few EMAC variables
docker pull registry.gitlab.com/inria-chile/tranque/fake-beats:dev
docker run \
       --rm \
       --entrypoint '' \
       -v $(pwd):/recipe \
       -e "NAMESPACE=dev.local" \
       -e "FAKING_BEHAVIOUR=/recipe/faking-behaviours/**/*.json" \
       registry.gitlab.com/inria-chile/tranque/fake-beats:dev \
       yarn -s start static 2015 2020-06 \
    | docker-compose run --rm enrichment yarn start bulksave

# Start enrichment to be able to run calculations
docker-compose up -d postgis elasticsearch rabbitmq enrichment stats
sleep 5

# EMAC calculations
docker-compose run \
               --rm \
               -v $(pwd):/recipe \
               backend \
               ./manage.py etloperation el-mauro /recipe/emac-data.tsv --context '{"batch": "month"}'
