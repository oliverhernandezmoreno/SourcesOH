FROM nginx:1.15.3-alpine

COPY nginx.conf /etc/nginx

# this image expects to provide default.conf file as a docker volume

# healthcheck
HEALTHCHECK --interval=1s --timeout=5s --retries=120 \
  CMD nc -z localhost 80 || exit 1
