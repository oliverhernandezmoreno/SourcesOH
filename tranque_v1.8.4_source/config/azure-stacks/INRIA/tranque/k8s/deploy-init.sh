#/bin/bash

# version actual 1-8-0

#backend
sudo docker pull registry.gitlab.com/inria-chile/tranque/backend:v1-8-0
sudo docker tag registry.gitlab.com/inria-chile/tranque/backend:v1-8-0 tranqueacr.azurecr.io/tranque/backend:v1-8-0
sudo docker push tranqueacr.azurecr.io/tranque/backend:v1-8-0

#frontend
sudo docker pull registry.gitlab.com/inria-chile/tranque/e700-frontend/smc:v1-8-0
sudo docker tag registry.gitlab.com/inria-chile/tranque/e700-frontend/smc:v1-8-0 tranqueacr.azurecr.io/tranque/e700-frontend/smc:v1-8-0
sudo docker push tranqueacr.azurecr.io/tranque/e700-frontend/smc:v1-8-0

#estatico backend
sudo docker pull registry.gitlab.com/inria-chile/tranque/backend/static-nginx:v1-8-0
sudo docker tag registry.gitlab.com/inria-chile/tranque/backend/static-nginx:v1-8-0 tranqueacr.azurecr.io/tranque/backend/static-nginx:v1-8-0
sudo docker push tranqueacr.azurecr.io/tranque/backend/static-nginx:v1-8-0

#enrichment
sudo docker pull registry.gitlab.com/inria-chile/tranque/enrichment:v1-8-0
sudo docker tag registry.gitlab.com/inria-chile/tranque/enrichment:v1-8-0 tranqueacr.azurecr.io/tranque/enrichment:v1-8-0
sudo docker push tranqueacr.azurecr.io/tranque/enrichment:v1-8-0


kubectl apply -f namespace.yml
kubectl apply -f configs.secret.yml
kubectl apply -f configs.yml
kubectl apply -f svc/
kubectl apply -f pod/
kubectl apply -f job/
watch kubectl get all --namespace=tranque
