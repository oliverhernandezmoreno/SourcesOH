FROM alpine:3.8

# install required apps
RUN apk add --update --no-cache \
  tini \
  bash \
  curl && \
  rm -rf /var/cache/apk/*

# entrypoint
COPY entrypoint.sh /entrypoint
COPY monitor.sh /monitor
ENTRYPOINT ["/sbin/tini", "--", "/entrypoint"]
CMD ["crond", "-f"]

# healthcheck
HEALTHCHECK --interval=1s --timeout=5s --retries=120 \
  CMD crontab -l || exit 1
