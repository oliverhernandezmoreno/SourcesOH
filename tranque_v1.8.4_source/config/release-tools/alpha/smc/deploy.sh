#!/bin/sh

# Example: ./deploy.sh v1.8.0 v1.0.0 v1.0.1 v1.0.2 v1.2.0 v1.1.0 v1.2.1 v1.0.2 v1.2.0 2020-07-23_21-16-36

tranque_version=`echo ${1} | sed 's/\./-/g'`
frontend_version=`echo ${2} | sed 's/\./-/g'`
backend_version=`echo ${3} | sed 's/\./-/g'`
enrichment_version=`echo ${4} | sed 's/\./-/g'`
stream_snapshot_version=`echo ${5} | sed 's/\./-/g'`
beats_consumer_version=`echo ${6} | sed 's/\./-/g'`
stats_version=`echo ${7} | sed 's/\./-/g'`
archivist_version=`echo ${8} | sed 's/\./-/g'`
config_version=`echo ${9} | sed 's/\./-/g'`

echo "Deploying SMC ${1}..."

deploy_template="deploy-template.sh"
deploy_filename="deploy-${tranque_version}-${10}.sh"

elasticsearch_template="./job/configure-elasticsearch-template.yml"
elasticsearch_filename="./job/configure-elasticsearch-${tranque_version}-${10}.yml"

maintenance_template="./job/maintenance-template.yml"
maintenance_filename="./job/maintenance-${tranque_version}-${10}.yml"

admin_template="./pod/admin-pod-template.yml"
admin_filename="./pod/admin-pod-${tranque_version}-${10}.yml"

api_template="./pod/api-pod-template.yml"
api_filename="./pod/api-pod-${tranque_version}-${10}.yml"

consu_alert_template="./pod/consu-alert-pod-template.yml"
consu_alert_filename="./pod/consu-alert-pod-${tranque_version}-${10}.yml"

front_template="./pod/front-pod-template.yml"
front_filename="./pod/front-pod-${tranque_version}-${10}.yml"

static_template="./pod/static-pod-template.yml"
static_filename="./pod/static-pod-${static_version}-${10}.yml"

cp ${deploy_template} ${deploy_filename}
cp ${elasticsearch_template} ${elasticsearch_filename}
cp ${maintenance_template} ${maintenance_filename}
cp ${admin_template} ${admin_filename}
cp ${api_template} ${api_filename}
cp ${consu_alert_template} ${consu_alert_filename}
cp ${consu_template} ${consu_filename}
cp ${front_template} ${front_filename}
cp ${static_template} ${static_filename}

sed -i "s/{frontend_version}/${frontend_version}/g" ${deploy_filename}
sed -i "s/{backend_version}/${backend_version}/g" ${deploy_filename}
sed -i "s/{enrichment_version}/${enrichment_version}/g" ${deploy_filename}
sed -i "s/{elasticsearch_version}/${elasticsearch_version}/g" ${elasticsearch_filename}
sed -i "s/{backend_version}/${backend_version}/g" ${maintenance_filename}
sed -i "s/{backend_version}/${backend_version}/g" ${admin_filename}
sed -i "s/{backend_version}/${backend_version}/g" ${api_filename}
sed -i "s/{backend_version}/${backend_version}/g" ${consu_filename}
sed -i "s/{backend_version}/${backend_version}/g" ${consu_alert_filename}
sed -i "s/{frontend_version}/${frontend_version}/g" ${front_filename}
sed -i "s/{backend_version}/${backend_version}/g" ${static_filename}

cat ${deploy_filename}
cat ${elasticsearch_filename}
cat ${maintenance_filename}
cat ${admin_filename}
cat ${api_filename}
cat ${consu_alert_filename}
cat ${consu_filename}
cat ${front_filename}
cat ${static_filename}

key="controller"
chmod 600 ${key}
user="avalencia"
host="40.122.170.93"

source_deploy_filename="./${deploy_filename}"
target_deploy_filename="~/config/azure-stacks/INRIA/tranque/k8s/${deploy_filename}"

source_elasticsearch_filename="./job/${elasticsearch_filename}"
target_elasticsearch_filename="~/config/azure-stacks/INRIA/tranque/k8s/job/${elasticsearch_filename}"

source_maintenance_filename="./job/${maintenance_filename}"
target_maintenance_filename="~/config/azure-stacks/INRIA/tranque/k8s/job/${maintenance_filename}"

source_admin_filename="./pod/${admin_filename}"
target_admin_filename="~/config/azure-stacks/INRIA/tranque/k8s/pod/${admin_filename}"

source_api_filename="./pod/${api_filename}"
target_api_filename="~/config/azure-stacks/INRIA/tranque/k8s/pod/${api_filename}"

source_consu_alert_filename="./pod/${consu_alert_filename}"
target_consu_alert_filename="~/config/azure-stacks/INRIA/tranque/k8s/pod/${consu_alert_filename}"

source_consu_filename="./pod/${consu_filename}"
target_consu_filename="~/config/azure-stacks/INRIA/tranque/k8s/pod/${consu_filename}"

source_front_filename="./pod/${front_filename}"
target_front_filename="~/config/azure-stacks/INRIA/tranque/k8s/pod/${front_filename}"

source_static_filename="./pod/${static_filename}"
target_static_filename="~/config/azure-stacks/INRIA/tranque/k8s/pod/${static_filename}"

scp -i ${key} ${source_deploy_filename} ${user}@${host}:${target_deploy_filename}
scp -i ${key} ${source_elasticsearch_filename} ${user}@${host}:${target_elasticsearch_filename}
scp -i ${key} ${source_maintenance_filename} ${user}@${host}:${target_maintenance_filename}
scp -i ${key} ${source_admin_filename} ${user}@${host}:${target_admin_filename}
scp -i ${key} ${source_consu_alert_filename} ${user}@${host}:${target_consu_filename}
scp -i ${key} ${source_consu_filename} ${user}@${host}:${target_consu_filename}
scp -i ${key} ${source_front_filename} ${user}@${host}:${target_front_filename}
scp -i ${key} ${source_static_filename} ${user}@${host}:${target_static_filename}

echo "Deploy of SMC ${1} was done."
