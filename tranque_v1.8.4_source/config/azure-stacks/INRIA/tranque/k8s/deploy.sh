#/bin/bash

#version actual 1-8-2
#
#sed -i 's/1-8-0/1-8-2/g' "deploy.sh"


#backend
sudo docker pull registry.gitlab.com/inria-chile/tranque/backend:v1-8-2
sudo docker tag registry.gitlab.com/inria-chile/tranque/backend:v1-8-2 tranqueacr.azurecr.io/tranque/backend:v1-8-2
sudo docker push tranqueacr.azurecr.io/tranque/backend:v1-8-2

#frontend
sudo docker pull registry.gitlab.com/inria-chile/tranque/e700-frontend/smc:v1-8-3
sudo docker tag registry.gitlab.com/inria-chile/tranque/e700-frontend/smc:v1-8-3 tranqueacr.azurecr.io/tranque/e700-frontend/smc:v1-8-3
sudo docker push tranqueacr.azurecr.io/tranque/e700-frontend/smc:v1-8-3

#estatico backend
sudo docker pull registry.gitlab.com/inria-chile/tranque/backend/static-nginx:v1-8-2
sudo docker tag registry.gitlab.com/inria-chile/tranque/backend/static-nginx:v1-8-2 tranqueacr.azurecr.io/tranque/backend/static-nginx:v1-8-2
sudo docker push tranqueacr.azurecr.io/tranque/backend/static-nginx:v1-8-2

#enrichment
sudo docker pull registry.gitlab.com/inria-chile/tranque/enrichment:v1-6-5
sudo docker tag registry.gitlab.com/inria-chile/tranque/enrichment:v1-6-5 tranqueacr.azurecr.io/tranque/enrichment:v1-6-5
sudo docker push tranqueacr.azurecr.io/tranque/enrichment:v1-6-5
