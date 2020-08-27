#!/usr/bin/env bash

set -e

HOME=/home/ec2-user
BACKUPS_DIR="${HOME}/backups"
STACK_DIR="${HOME}/stack"

today="$(date -Idate)"
now="$(date +%s)"
BUNDLE="bundle-${today}-${now}"
BATCH_DIR="${BACKUPS_DIR}/${BUNDLE}"
mkdir -p "${BATCH_DIR}"

cd "${STACK_DIR}"
docker-compose exec -T postgis \
               pg_dump -U backend \
               > "${BATCH_DIR}/postgis-${now}.sql"
docker-compose exec -T django \
               ./es-dump elasticsearch:9200 'raw-*' \
               > "${BATCH_DIR}/elasticseach-raw-${now}.ndjson"
docker-compose exec -T django \
               ./es-dump elasticsearch:9200 'derived-*' \
               > "${BATCH_DIR}/elasticsearch-derived-${now}.ndjson"
docker-compose exec -T storage \
               tar cf - /data \
               > "${BATCH_DIR}/storage-${now}.tar"

cd "${BACKUPS_DIR}"
tar czf "${BUNDLE}.tgz" "${BUNDLE}"
rm -rf "${BUNDLE}"

export AWS_ACCESS_KEY_ID="AKIA323NISWONYTU4DSV"
export AWS_SECRET_ACCESS_KEY="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"
aws s3 cp "${BUNDLE}.tgz" "s3://tranque-qa-backups/qa-smc/${BUNDLE}.tgz"
