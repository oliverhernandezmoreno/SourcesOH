#!/bin/sh

set -e

mkdir -p "/data/${S3_BUCKET_NAME}"
mkdir -p "/data/${BACKUP_BUCKET_NAME}"

exec "$@"
