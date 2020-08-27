#!/bin/sh

cp -r /var/www-src/* /var/www/

{
    echo -n 'window.configuration='
    printenv \
        | grep '^OVERRIDE_' \
        | cut -d '=' -f 1 \
        | jq -cMR 'select(env[.] != null and env[.] != "") | {key: .[9:], value: env[.]}' \
        | jq -scM 'from_entries'
} > /var/www/configuration.js

exec "$@"
