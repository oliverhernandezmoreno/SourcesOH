#!/usr/bin/env bash

set -e

export > /cron.env

crontab <<EOF
${CRON_SCHEDULE:-"0 1 * * *"} /app/docker/cronjob.sh 1>> /proc/1/fd/1 2>> /proc/1/fd/2
EOF

exec "$@"
