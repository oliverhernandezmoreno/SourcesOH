FROM registry.gitlab.com/inria-chile/tranque/index-builder:latest as builder

ARG CI_COMMIT_SHA=local
ARG CI_PROJECT_NAME=tranque-index

ENV CI_COMMIT_SHA ${CI_COMMIT_SHA}
ENV CI_PROJECT_NAME ${CI_PROJECT_NAME}

WORKDIR /usr/src/app
COPY src ./src
RUN tar czf - src | build > build.tgz

FROM scratch
COPY --from=builder /usr/src/app/build.tgz /build.tgz
ENTRYPOINT ["/this-image-cant-run"]
