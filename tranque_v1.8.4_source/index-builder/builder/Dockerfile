FROM node:lts-alpine

ARG COMMIT=local
ENV BUILDER_COMMIT ${COMMIT}

WORKDIR /usr/src/builder
COPY . .
RUN yarn install --non-interactive && \
  ln -s /usr/src/builder/build.sh build && \
  mv build /bin/build

CMD ["build"]
