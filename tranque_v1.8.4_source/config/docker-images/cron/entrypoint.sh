#!/bin/bash

set -e

# prepare debugging
SCRIPT_NAME=$(basename "$0")

echo "[${SCRIPT_NAME}] Waiting for dependencies"
while ! nc -z "${BACKEND_HOST:-localhost}" "${BACKEND_PORT:-8000}"
do
    echo "[${SCRIPT_NAME}] Waiting for backend API"
    sleep 1
done
echo "[${SCRIPT_NAME}] Dependencies are running"

echo "[${SCRIPT_NAME}] Exporting environment"
export > /cron.env

echo "[${SCRIPT_NAME}] Installing periodic jobs"
if [[ -z "${CRON_ENTRIES}" ]]
then
   periods=(
       "15min"
       "hourly"
       "daily"
       "weekly"
       "monthly"
   )
else
    find /etc/periodic -mindepth 1 | xargs rm -rf
    touch /tmp/crontab.custom

    periods=()
    IFS="|" read -r -a entries <<< "${CRON_ENTRIES}"
    for index in "${!entries[@]}"
    do
        entry="${entries[$index]}"
        IFS=":" read -r -a pair <<< "${entry}"
        if [[ "${#pair[@]}" == "2" ]]
        then
            period="${pair[0]}"
            entry="${pair[1]}"
        else
            period="custom-${index}"
        fi
        periods+=("${period}")
        mkdir -p "/etc/periodic/${period}"
        echo "${entry}" "run-parts /etc/periodic/${period}" >> /tmp/crontab.custom
    done

    crontab /tmp/crontab.custom
fi

echo "[${SCRIPT_NAME}] Crontab"
crontab -l

for period in "${periods[@]}"
do
    echo "[${SCRIPT_NAME}] Installing cron entry: ${period}"
    sed "s/__PERIOD__/${period}/g" > "/etc/periodic/${period}/monitor" < /monitor
    chmod a+x "/etc/periodic/${period}/monitor"
done

echo "[${SCRIPT_NAME}] Starting '$@'"
exec "$@"
