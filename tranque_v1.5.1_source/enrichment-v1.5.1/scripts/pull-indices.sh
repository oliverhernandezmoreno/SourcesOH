#!/usr/bin/env bash

set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"
EF_REPO="${EF_REPO:-registry.gitlab.com/inria-chile/tranque/ef}"
EMAC_REPO="${EMAC_REPO:-registry.gitlab.com/inria-chile/tranque/emac}"

# Pull all the whitelisted images

echo "Pulling images ..."
docker pull "${EF_REPO}" -a > /dev/null
docker pull "${EMAC_REPO}" -a > /dev/null

INDICES="$(dirname $DIR)/impl/engine/indices"
TMP_INDICES="$(dirname $DIR)/impl/engine/indices-tmp"
mkdir -p "${INDICES}"
mkdir -p "${TMP_INDICES}"

docker images "${EF_REPO}" --format "{{.Repository}}:{{.Tag}}" | while read -r image
do
    tag="$(echo $image | cut -d ':' -f 2)"
    mkdir -p "${TMP_INDICES}/ef/${tag}"
    container=$(docker create "${image}")
    docker cp "${container}:/build.tgz" /tmp/build.tgz
    tar xz -C /tmp -f /tmp/build.tgz
    mv /tmp/build/* "${TMP_INDICES}/ef/${tag}/"
    rm /tmp/build.tgz
    rm -rf /tmp/build
    docker rm "$container" > /dev/null
    echo "Pulled ef:${tag}"
done

docker images "${EMAC_REPO}" --format "{{.Repository}}:{{.Tag}}" | while read -r image
do
    tag="$(echo $image | cut -d ':' -f 2)"
    mkdir -p "${TMP_INDICES}/emac/${tag}"
    container=$(docker create "${image}")
    docker cp "${container}:/build.tgz" /tmp/build.tgz
    tar xz -C /tmp -f /tmp/build.tgz
    mv /tmp/build/* "${TMP_INDICES}/emac/${tag}/"
    rm /tmp/build.tgz
    rm -rf /tmp/build
    docker rm "$container" > /dev/null
    echo "Pulled emac:${tag}"
done

mv "${INDICES}" "${INDICES}-old"
mv "${TMP_INDICES}" "${INDICES}"
rm -rf "${INDICES}-old"

echo "Done!"
