#!/bin/sh

set -e

# This entrypoint turns the configuration file 'default.template' in this
# directory into an SSL-able configuration if the files
# 'fullchain.pem' and 'privkey.pem' are both found within the current
# folder.

PORT=80
SSL_CERTIFICATE=
SSL_CERTIFICATE_KEY=
CATCH_80_CLAUSE=

if [ -f "/entrypoint/fullchain.pem" -a -f "/entrypoint/privkey.pem" ]
then
    PORT="443 ssl"
    SSL_CERTIFICATE="ssl_certificate /entrypoint/fullchain.pem;"
    SSL_CERTIFICATE_KEY="ssl_certificate_key /entrypoint/privkey.pem;"
    CATCH_80_CLAUSE='server { listen 80; server_name _; return 301 https://$host$request_uri; }'
fi

env -i \
    "PORT=$PORT" \
    "SSL_CERTIFICATE=$SSL_CERTIFICATE" \
    "SSL_CERTIFICATE_KEY=$SSL_CERTIFICATE_KEY" \
    "CATCH_80_CLAUSE=$CATCH_80_CLAUSE" \
    envsubst '$PORT $SSL_CERTIFICATE $SSL_CERTIFICATE_KEY $CATCH_80_CLAUSE' \
    < /entrypoint/default.template \
    > /etc/nginx/conf.d/default.conf

exec "$@"
