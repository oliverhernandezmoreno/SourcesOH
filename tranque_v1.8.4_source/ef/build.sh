#!/usr/bin/env bash

set -e

dir=$(pwd)
docker pull registry.gitlab.com/inria-chile/tranque/index-builder
tar czf - src | docker run --rm -i registry.gitlab.com/inria-chile/tranque/index-builder build $(basename $dir) > "${1:-build.tgz}"
