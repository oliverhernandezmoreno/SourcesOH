#!/bin/sh

# Example: ./deploy.sh v1.8.0 v1.0.0 v1.0.1 v1.0.2 v1.2.0 v1.1.0 v1.2.1 v1.0.2 v1.2.0 2020-07-23_21-16-36

tranque_version=`echo ${1} | sed 's/\./-/g'`

echo "Deploying SML ${1}..."

template="docker-compose-template.yml"
filename="docker-compose-${tranque_version}-${10}.yml"

cp ${template} ${filename}

sed -i "s/{frontend_version}/${2}/g" ${filename}
sed -i "s/{backend_version}/${3}/g" ${filename}
sed -i "s/{enrichment_version}/${4}/g" ${filename}
sed -i "s/{stream_snapshot_version}/${5}/g" ${filename}
sed -i "s/{beats_consumer_version}/${6}/g" ${filename}
sed -i "s/{stats_version}/${7}/g" ${filename}
sed -i "s/{archivist_version}/${8}/g" ${filename}
sed -i "s/{config_version}/${9}/g" ${filename}

cat ${filename}

key="tranque-alfa.pem"
chmod 600 ${key}
source="./${filename}"
user="inriadev"
host="104.43.198.74"
target="/opt/tranque-platform/tranque/${filename}"

scp -i ${key} ${source} ${user}@${host}:${target}

echo "Deploy of SML ${1} was done."
