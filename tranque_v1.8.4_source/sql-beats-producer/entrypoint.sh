#!/bin/bash

set -e

if [ -n "${SERVER_PUBLIC_KEY}" ]
then
    echo "[entrypoint.sh] Installing trusted server key"
    echo -n "${SERVER_PUBLIC_KEY}" | base64 -d > /etc/ssl/certs/application-specific
    keytool -importcert \
            -noprompt \
            -alias "consumer" \
            -file /etc/ssl/certs/application-specific \
            -keystore /etc/ssl/certs/java/cacerts \
            -storepass changeit || :
fi

if [ -d "${EXTRA_RESOURCES}" ]
then
    echo "[entrypoint.sh] Copying additional resources"
    mkdir -p /app/resources
    cp -RT "${EXTRA_RESOURCES}" /app/resources
fi

exec "$@"
