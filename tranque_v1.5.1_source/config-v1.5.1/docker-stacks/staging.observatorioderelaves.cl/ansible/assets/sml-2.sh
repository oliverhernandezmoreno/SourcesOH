#!/usr/bin/env bash

set -e

# variables (prefixed with __REPLACED_):
# TARGET__ the target's canonical name
# DOMAIN__ the stack's domain name
# NAMESPACE__ the stack's namespace
# BUCKET__ the stack's bucket, both local and remote
# AMQPUSER__ the rabbitmq user used to connect to the central broker
# AMQPPASS__ the rabbitmq password used to connect to the central broker
# USERS_FILE__ the secrets file holding the user profiles

AMQPPASS=$(cat ./sml-2.secrets | grep "^AMQPPASS=" | sed -e "s/^AMQPPASS=//g")

find stack -type f | while read -r templatefile ; do
    sed -i \
        -e "s/__REPLACED_TARGET__/ovejeria/g" \
        -e "s/__REPLACED_DOMAIN__/staging-sml-2.observatorioderelaves.cl/g" \
        -e "s/__REPLACED_NAMESPACE__/staging-sml-2/g" \
        -e "s/__REPLACED_BUCKET__/sml-2/g" \
        -e "s/__REPLACED_AMQPUSER__/sml-2/g" \
        -e "s/__REPLACED_AMQPPASS__/${AMQPPASS}/g" \
        -e "s/__REPLACED_USERS_FILE__/users-sml-2.secrets/g" \
        "${templatefile}"
done
