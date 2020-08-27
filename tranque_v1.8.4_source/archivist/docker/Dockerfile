FROM registry.gitlab.com/inria-chile/tranque/archivist/base:latest
COPY . .
RUN ln -s /app/src/archivist.py /usr/bin/archivist
ENTRYPOINT ["/tini", "--", "/app/docker/entrypoint.sh"]
CMD ["cron", "-f"]
