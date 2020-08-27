#!/bin/bash
# Bash Menu Script Example

#!/bin/bash
# Ask the user for their name

var=sudo cat ./deploy.sh |grep version 

echo  $var  

echo Ingrese versión actual:
read varname

echo Ingrese nueva versión:
read varname2

sed -i 's/'$varname'/'$varname2'/g' "deploy.sh"
sed -i 's/'$varname'/'$varname2'/g' "pod/api-pod.yml"
sed -i 's/'$varname'/'$varname2'/g' "pod/admin-pod.yml"
sed -i 's/'$varname'/'$varname2'/g' "pod/consu-pod.yml"
sed -i 's/'$varname'/'$varname2'/g' "pod/front-pod.yml"
sed -i 's/'$varname'/'$varname2'/g' "pod/static-pod.yml"
sed -i 's/'$varname'/'$varname2'/g' "job/maintenance.yml"
#sed -i 's/'$varname'/'$varname2'/g' "job/configure-elasticsearch.yml"

sh deploy.sh

kubectl apply -f namespace.yml
kubectl apply -f configs.secret.yml
kubectl apply -f configs.yml
kubectl apply -f svc/
kubectl apply -f pod/
kubectl apply -f job/
watch kubectl get all --namespace=tranque
