#!/usr/bin/env bash

set -e

usage() {
    echo "Usage: ./deploy.sh <gitlab-user> <gitlab-password>" 1>&2
    exit 1
}

if [ -z "$1" ] ; then usage ; fi
if [ -z "$2" ] ; then usage ; fi

cd $(dirname "${BASH_SOURCE[0]}")

docker login -u "$1" -p "$2" registry.gitlab.com/inria-chile
docker-compose pull
docker-compose up -d --remove-orphans
docker system prune -f
