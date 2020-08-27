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

command_exists () {
    type "$1" &> /dev/null ;
}

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

if command_exists jq ; then
  cat "${build}/$(basename $dir).manifest" | \
      jq -Mr .entrypoints[] | \
      xargs docker exec "${container}" ./manage.py graphtemplate > "${dir}/graphs/full.svg"
  echo "Built full graph"

  cat "${build}/$(basename $dir).manifest" | \
      jq -Mr .entrypoints[] | \
      grep "$1" | \
      while read -r entrypoint
      do
          docker exec "${container}" ./manage.py graphtemplate "${entrypoint}" > "${dir}/graphs/dependency/${entrypoint}.svg"
          echo "Built dependency graph ${entrypoint}.svg"
      done

  cat "${build}/$(basename $dir).manifest" | \
      jq -Mr .inputs[] | \
      grep "$1" | \
      while read -r input
      do
          docker exec "${container}" ./manage.py graphtemplate --direction derivations "${input}" > "${dir}/graphs/influence/${input}.svg"
          echo "Built influence graph ${input}.svg"
      done
fi
