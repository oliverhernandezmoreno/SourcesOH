#!/bin/sh

set -e
set -x

mv /artifacts/target-dockerfile ./Dockerfile

docker login -u gitlab-ci-token -p "${CI_JOB_TOKEN}" "${CI_REGISTRY}"
docker build \
       -t "${CI_REGISTRY_IMAGE}:${CI_COMMIT_REF_SLUG}" \
       -t "${CI_REGISTRY_IMAGE}:${CI_COMMIT_SHA}" \
       --build-arg CI_COMMIT_SHA=${CI_COMMIT_SHA} \
       --build-arg CI_PROJECT_NAME=${CI_PROJECT_NAME} \
       .
docker push "${CI_REGISTRY_IMAGE}:${CI_COMMIT_REF_SLUG}"
docker push "${CI_REGISTRY_IMAGE}:${CI_COMMIT_SHA}"
