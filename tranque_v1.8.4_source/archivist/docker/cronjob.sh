#!/bin/bash

set -e

source /cron.env

echo "[cronjob.sh] Starting backup"
archivist check
archivist backup
echo "[cronjob.sh] Done"
