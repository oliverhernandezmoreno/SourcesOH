#!/bin/sh

# Example: ./restart.sh v1.8.0 2020-07-23_21-16-36

tranque_version=`echo ${1} | sed 's/\./-/g'`

echo "Re-starting SML ${1}..."

filename="docker-compose-${tranque_version}-${2}.yml"
cmd="cd /opt/tranque-platform/tranque/;"
cmd="${cmd} docker stop $(docker ps -q);"
cmd="${cmd} docker image prune;"
cmd="${cmd} docker system prune;"
cmd="${cmd} docker volume prune;"
cmd="${cmd} docker-compose down -v;"
cmd="${cmd} docker-compose -f ${filename} up"

key="tranque-alfa.pem"
source="./${filename}"
user="inriadev"
host="104.43.198.74"

ssh -i ${key} -l ${user} ${host} ${cmd}

echo "Restart of SML ${1} was done."
