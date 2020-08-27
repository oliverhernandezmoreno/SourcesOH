FROM nginx:1.19.1-alpine
COPY default.conf /etc/nginx/conf.d
COPY nginx.conf /etc/nginx

# healthcheck
HEALTHCHECK --interval=1s --timeout=5s --retries=120 \
  CMD nc -z localhost 80 || exit 1
