#!/bin/sh

# Example: ./restart.sh v1.8.0 2020-07-23_21-16-36

tranque_version=`echo ${1} | sed 's/\./-/g'`

echo "Re-starting SMC ${1}..."

filename="deploy-${tranque_version}-${2}.sh"

cmd="cd ~/config/azure-stacks/INRIA/tranque/k8s/;"
cmd="${cmd} ./${filename};"
cmd="${cmd} ./kubectl delete -f job/configure-elasticsearch.yml;"
cmd="${cmd} ./kubectl apply -f job/configure-elasticsearch.yml;"
cmd="${cmd} ./kubectl delete -f job/maintenance.yml;"
cmd="${cmd} ./kubectl apply -f job/maintenance.yml;"
cmd="${cmd} ./kubectl delete -f pod/admin-pod.yml;"
cmd="${cmd} ./kubectl apply -f pod/admin-pod.yml;"
cmd="${cmd} ./kubectl delete -f pod/api-pod.yml;"
cmd="${cmd} ./kubectl apply -f pod/api-pod.yml;"
cmd="${cmd} ./kubectl delete -f pod/consu-alert-pod.yml;"
cmd="${cmd} ./kubectl apply -f pod/consu-alert-pod.yml;"
cmd="${cmd} ./kubectl delete -f pod/front-pod.yml;"
cmd="${cmd} ./kubectl apply -f pod/front-pod.yml;"
cmd="${cmd} ./kubectl delete -f pod/static-pod.yml;"
cmd="${cmd} ./kubectl apply -f pod/static-pod.yml;"

key="controller"
source="./${filename}"
user="avalencia"
host="40.122.170.93"

ssh -i ${key} -l ${user} ${host} ${cmd}

echo "Restart of SMC ${1} was done."
