ARG BASE_VARIANT=dev
FROM registry.gitlab.com/inria-chile/tranque/stats/base:${BASE_VARIANT}

COPY src .

ARG CI_COMMIT_SHA=local
ENV COMMIT ${CI_COMMIT_SHA}

EXPOSE 5000

CMD ["gunicorn", "-w 4", "--bind=0.0.0.0:5000", "-t 300", "main:app"]

HEALTHCHECK --interval=1s --timeout=5s --retries=120 \
  CMD nc -z localhost 5000 || exit 1
