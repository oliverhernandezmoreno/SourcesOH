#/bin/bash

#backend
sudo docker pull fundacionchile.azurecr.io/tranque/backend:v1-6-1
sudo docker tag fundacionchile.azurecr.io/tranque/backend:v1-6-1 acrsngm.azurecr.io/tranque/backend:v1-6-1
sudo docker push acrsngm.azurecr.io/tranque/backend:v1-6-1

#frontend
sudo docker pull fundacionchile.azurecr.io/tranque/frontend:v1-6-1-smc
sudo docker tag fundacionchile.azurecr.io/tranque/frontend:v1-6-1-smc acrsngm.azurecr.io/tranque/e700-frontend/smc:v1-6-1
sudo docker push acrsngm.azurecr.io/tranque/e700-frontend/smc:v1-6-1

#estatico backend
sudo docker pull fundacionchile.azurecr.io/tranque/django-static:v1-6-1
sudo docker tag fundacionchile.azurecr.io/tranque/django-static:v1-6-1 acrsngm.azurecr.io/tranque/backend/django-static:v1-6-1
sudo docker push acrsngm.azurecr.io/tranque/backend/django-static:v1-6-1


kubectl apply -f namespace.yml
kubectl apply -f configs.secret.yml
kubectl apply -f configs.yml
kubectl apply -f svc/
kubectl apply -f pod/
