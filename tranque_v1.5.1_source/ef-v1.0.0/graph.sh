#!/usr/bin/env bash

set -e

image="registry.gitlab.com/inria-chile/tranque/backend:dev"
docker pull "${image}"
container=$(docker run --rm -d --entrypoint '' -e PROFILES_BASE=/tmp/build "${image}" tail -f /dev/null)

function dockerstop {
    echo "Removing container"
    docker stop "${container}"
}
trap dockerstop EXIT

./test.sh

dir=$(pwd)
mkdir -p "${dir}/graphs/dependency"
mkdir -p "${dir}/graphs/influence"
if [ -z "$1" ]
then
    touch "${dir}/graphs/delete.me"
    find "${dir}/graphs" -type f | xargs rm
fi
build="${dir}/build"

docker cp "${build}" "${container}:/tmp"

cat "${build}/$(basename $dir).manifest" | \
    jq -Mr .entrypoints[] | \
    xargs docker exec "${container}" ./manage.py graphtemplate > "${dir}/graphs/full.svg"
echo "Built full graph"

entrypoints=$(
    cat "${build}/$(basename $dir).manifest" | \
        jq -Mr .entrypoints[] | \
        eval "grep $@ || :"
)

if [ -n "$entrypoints" ]
then
    echo -n "$entrypoints" \
        | xargs docker exec "${container}" ./manage.py graphtemplate \
                > "${dir}/graphs/dependency/graph.svg"
    echo "Built dependency graph"
fi

inputs=$(
    cat "${build}/$(basename $dir).manifest" | \
        jq -Mr .inputs[] | \
        eval "grep $@ || :"
)

if [ -n "$inputs" ]
then
    echo -n "$inputs" \
        | xargs docker exec "${container}" ./manage.py graphtemplate --direction derivations \
                > "${dir}/graphs/influence/graph.svg"
    echo "Built influence graph"
fi
