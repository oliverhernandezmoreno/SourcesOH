#!/usr/bin/env bash
set -e
cd $( dirname "${BASH_SOURCE[0]}")
CI_JOB_TOKEN=$1
CI_REGISTRY=$2
# docker login
docker login -u gitlab-ci-token -p ${CI_JOB_TOKEN} ${CI_REGISTRY}
# pull new images
docker-compose pull
# start or recreate images
docker-compose up -d --remove-orphans
# clean up docker
docker system prune -f
