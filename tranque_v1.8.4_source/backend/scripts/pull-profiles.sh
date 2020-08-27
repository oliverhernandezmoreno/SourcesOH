#!/usr/bin/env bash

set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"

function rmcontainers {
    if [[ -n "$EF" ]] ; then docker rm "$EF" ; fi
    if [[ -n "$EMAC" ]] ; then docker rm "$EMAC" ; fi
}
trap rmcontainers EXIT

docker pull registry.gitlab.com/inria-chile/tranque/ef:master
docker pull registry.gitlab.com/inria-chile/tranque/emac:master

PROFILES_BASE="${PROFILES_BASE:-$DIR/../src/profiles}"
mkdir -p "${PROFILES_BASE}"

echo "[pull-profiles.sh] Installing EF profiles"
EF=$(docker create registry.gitlab.com/inria-chile/tranque/ef:master)
docker cp "${EF}:/build.tgz" /tmp/build.tgz
tar zx -C /tmp -f /tmp/build.tgz
cp -R /tmp/build/* "${PROFILES_BASE}/"
rm /tmp/build.tgz
rm -rf /tmp/build

echo "[pull-profiles.sh] Installing EMAC profiles"
EMAC=$(docker create registry.gitlab.com/inria-chile/tranque/emac:master)
docker cp "${EMAC}:/build.tgz" /tmp/build.tgz
tar zx -C /tmp -f /tmp/build.tgz
cp -R /tmp/build/* "${PROFILES_BASE}/"
rm /tmp/build.tgz
rm -rf /tmp/build

echo "[pull-profiles.sh] Done"
