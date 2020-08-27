#!/usr/bin/env bash

set -e

echo "[entrypoint.sh] Waiting for dependencies"
deps=(
    "${DATABASE_HOST:-localhost}:${DATABASE_PORT:-5432}"
)
for dep in "${deps[@]}"
do
    IFS=: read -r service port <<< "$dep"
    while ! nc -z "$service" "$port"
    do
        echo "[entrypoint.sh] Waiting for $service:$port"
        sleep 1
    done
done
echo "[entrypoint.sh] Dependencies are running"

echo "[entrypoint.sh] Applying migrations"
./manage.py migrate

# Run maintenance tasks in parallel
(
    if [ -n "${INTERNAL_CREDENTIALS}" ]
    then
        IFS="," read -r -a credentials <<< "${INTERNAL_CREDENTIALS}"
        for credential in "${credentials[@]}"
        do
            IFS=":" read -r -a pair <<< "${credential}"
            username="${pair[0]}"
            token="${pair[1]}"
            echo "[entrypoint.sh] Installing internal credential ${username} ${token}"
            ./manage.py assertcredentials "${username}" "${token}"
        done
    fi

    SUPERUSER_USERNAME="${SUPERUSER_USERNAME:-admin}"
    echo "[entrypoint.sh] Installing superuser ${SUPERUSER_USERNAME}"
    ./manage.py assertsuperuser "${SUPERUSER_USERNAME}" "${SUPERUSER_PASSWORD:-$SUPERUSER_USERNAME}"

    echo "[entrypoint.sh] Loading user groups"
    ./manage.py loaddata fixtures/groups.json
    echo "[entrypoint.sh] Loading system user"
    ./manage.py loaddata fixtures/system_user.json
    echo "[entrypoint.sh] Loading document type"
    ./manage.py loaddata fixtures/document_type.json
    echo "[entrypoint.sh] Loading wiki links"
    ./manage.py loaddata fixtures/wiki_links.json

    if [[ -d /initial-setup ]]
    then
        find /initial-setup -type f -executable | sort | while read -r setupscript
        do
            echo "[entrypoint.sh] Running ${setupscript}"
            "${setupscript}"
        done
    fi
) &

echo "[entrypoint.sh] Starting '$@'"
exec "$@"
