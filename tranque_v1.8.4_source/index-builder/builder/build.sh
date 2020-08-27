#!/bin/sh

set -e

currentdir="$(pwd)"
workdir="$(mktemp -d)"
mkdir -p "${workdir}/build"

tar xz -C "${workdir}" < "${2:-/dev/stdin}"
cd /usr/src/builder && \
    yarn -s build "${workdir}" "$1" && \
    yarn -s test --roots "${workdir}/build" && \
    cd "${workdir}" && \
    tar czf build.tgz build && \
    cd "${currentdir}"

cat "${workdir}/build.tgz"
