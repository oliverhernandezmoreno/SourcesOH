#!/bin/bash
while ! nc -z "${DATABASE_HOST}" "${DATABASE_PORT}"
do
    echo 'Waiting for db...'
    sleep 1
done

while ! nc -z "${ELASTICSEARCH_HOST:-localhost}" "${ELASTICSEARCH_PORT:-9200}"
do
    echo "Waiting for elasticsearch"
    sleep 1
done

python /usr/src/app/src/manage.py runserver_plus 0.0.0.0:8000
